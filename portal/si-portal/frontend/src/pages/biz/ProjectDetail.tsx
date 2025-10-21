import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
// (수정) 사용자님 프로젝트 경로 별칭(~) 사용
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { addTab, setActiveTab } from '~store/RootTabs';

// --- (ProjectList에서 복사) Progress Bar를 위한 커스텀 셀 렌더러 ---
const ProgressBarRenderer = (props: ICellRendererParams<any, number>) => {
    const value = props.value ?? 0;
    const valueAsPercent = value + '%';
    const progressBarStyle = {
        width: valueAsPercent,
        height: '100%',
        backgroundColor: '#007bff',
        borderRadius: '4px',
        transition: 'width 0.5s ease-in-out',
    };
    const wrapperStyle = {
        width: '100%',
        height: '70%',
        border: '1px solid #ced4da',
        borderRadius: '4px',
        backgroundColor: '#e9ecef',
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 5px' }}>
            <div style={wrapperStyle}>
                <div style={progressBarStyle} />
            </div>
            <span style={{ marginLeft: '8px' }}>{valueAsPercent}</span>
        </div>
    );
};


// --- 프론트엔드에서 사용할 데이터 타입 정의 ---

// ProjectProgressDetail 그리드용 타입
interface IProjectProgressDetail {
    gridRowId: string; // AgGrid의 행 구분을 위한 고유 ID
    detailId?: number; // 기존 데이터 식별자
    taskName: string;
    progressPercentage: number;
    weight: number;
    description: string;
    assigneeId: string;
    isCreated?: boolean; // 신규 행 여부
    isUpdated?: boolean; // 수정된 행 여부
}

// ProjectHumanResource 그리드용 타입
interface IProjectHumanResource {
    gridRowId: string; // AgGrid의 행 구분을 위한 고유 ID
    resourceAllocationId?: number; // 기존 데이터 식별자
    userId: string;
    roleId: number | null; // Role 엔티티 대신 ID로 관리 (혹은 Role 객체 전체)
    plannedMm: number;
    actualMm: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    isCreated?: boolean; // 신규 행 여부
    isUpdated?: boolean; // 수정된 행 여부
}

// 페이지 전체 폼 데이터 타입 (DTO 기반 + humanResources 추가)
interface IProjectDetailData {
    projectId: number | null;
    projectName: string;
    projectCode: string;
    projectDescription: string; // DTO의 description
    projectStatus: string;
    step: string;
    pmId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    overallProgress: number;
    progressDetails: IProjectProgressDetail[]; // DTO의 projectProgressDetails
    humanResources: IProjectHumanResource[]; // 이미지 기반 추가
}

// 초기 상태값
const initialState: IProjectDetailData = {
    projectId: null,
    projectName: '',
    projectCode: '',
    projectDescription: '',
    projectStatus: 'WAITING',
    step: 'IN PLANNING',
    pmId: '',
    startDate: '',
    endDate: '',
    overallProgress: 0,
    progressDetails: [],
    humanResources: [],
};


/**
 * 프로젝트 상세 페이지 컴포넌트
 */
const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id:string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState<IProjectDetailData>(initialState);
    const [deletedProgressDetails, setDeletedProgressDetails] = useState<number[]>([]);
    const [deletedHumanResources, setDeletedHumanResources] = useState<number[]>([]);

    const progressGridRef = useRef<AgGridWrapperHandle>(null);
    const resourceGridRef = useRef<AgGridWrapperHandle>(null);

    const [activeTabKey, setActiveTabKey] = useState('progress');

// --- [수정] 데이터 로드 (타입 변환 추가) ---
    useEffect(() => {
        // 2. fetchProjectDetail 함수는 명확하게 number 타입의 projectId를 받도록 수정
        const fetchProjectDetail = async (projectId: number) => {
            try {
                const token = sessionStorage.getItem('authToken');

                // 3. projectId(숫자)가 URL 문자열로 자동 변환되어 요청됨 (예: .../id/123)
                const response = await axios.get(`http://localhost:8080/project/detail/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data;

                // ... (데이터 매핑 로직은 동일)
                const formatDate = (dateStr: string | null | undefined) => {
                    if (!dateStr) return '';
                    return dateStr.split('T')[0];
                };
                // [수정] 폼에 바인딩되는 모든 필드에 대해 null 방어 코드 추가
                const formattedData: IProjectDetailData = {
                    ...data, // projectId, overallProgress 등 다른 값들은 그대로 복사

                    // --- 폼 입력 필드 Null Safety 처리 ---
                    projectName: data.projectName || '', // null이면 ""
                    projectCode: data.projectCode || '', // null이면 ""
                    projectDescription: data.projectDescription || '', // null이면 ""
                    projectStatus: data.projectStatus || 'PLANNING', // null이면 기본값
                    step: data.step || 'PROPOSAL', // null이면 기본값
                    pmId: data.pmId || '', // null이면 ""
                    overallProgress: data.overallProgress || 0,

                    // --- 날짜 및 그리드 처리 (기존과 동일) ---
                    startDate: formatDate(data.startDate),
                    endDate: formatDate(data.endDate),
                    progressDetails: (data.projectProgressDetails || []).map((item: any, index: number) => ({
                        ...item,
                        gridRowId: item.detailId || `temp-progress-${index}`,
                    })),
                    humanResources: (data.humanResources || []).map((item: any, index: number) => ({
                        ...item,
                        startDate: formatDate(item.startDate),
                        endDate: formatDate(item.endDate),
                        gridRowId: item.resourceAllocationId || `temp-resource-${index}`,
                    })),
                };
                setFormData(formattedData);
                progressGridRef.current?.setRowData(formattedData.progressDetails);
                resourceGridRef.current?.setRowData(formattedData.humanResources);

            } catch (error) {
                console.error("프로젝트 상세 정보를 불러오는 데 실패했습니다.", error);
                alert("데이터 로드 실패");
            }
        };

        // 4. id(string)가 존재하는지 확인하고, Number()로 형 변환하여 함수 호출
        if (id) {
            fetchProjectDetail(Number(id));
        }
    }, [id]);


    // --- 폼 입력 핸들러 ---
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }));
    }, []);

    // --- AgGrid 컬럼 정의 ---

    // 진행 상세 (ProjectProgressDetail) 컬럼
    const progressColumns = useMemo<ColDef[]>(() => [
        { headerName: '작업명', field: 'taskName', editable: true, flex: 2 },
        { headerName: '담당자', field: 'assigneeId', editable: true, flex: 1 },
        {
            headerName: '진행률(%)',
            field: 'progressPercentage',
            editable: true,
            cellEditor: 'agNumberCellEditor',
            cellRenderer: ProgressBarRenderer, // 커스텀 렌더러 사용
            flex: 1
        },
        {
            headerName: '가중치',
            field: 'weight',
            editable: true,
            cellEditor: 'agNumberCellEditor',
            flex: 1
        },
        {
            headerName: '상세설명',
            field: 'description',
            editable: true,
            cellEditor: 'agLargeTextCellEditor',
            flex: 3
        },
    ], []);

    // 투입 인력 (ProjectHumanResource) 컬럼
    const resourceColumns = useMemo<ColDef[]>(() => [
        { headerName: '인력 (UserID)', field: 'userId', editable: true, flex: 1 },
        {
            headerName: '역할 (RoleID)', // (수정) Role 객체 대신 ID 사용 가정. 필요시 Select Editor 사용
            field: 'roleId',
            editable: true,
            cellEditor: 'agNumberCellEditor', // (수정) 또는 agSelectCellEditor
            flex: 1
        },
        {
            headerName: '계획 M/M',
            field: 'plannedMm',
            editable: true,
            cellEditor: 'agNumberCellEditor',
            flex: 1
        },
        {
            headerName: '실행 M/M',
            field: 'actualMm',
            editable: true,
            cellEditor: 'agNumberCellEditor',
            flex: 1
        },
        {
            headerName: '시작일',
            field: 'startDate',
            editable: true,
            cellEditor: 'agDateCellEditor',
            flex: 1
        },
        {
            headerName: '종료일',
            field: 'endDate',
            editable: true,
            cellEditor: 'agDateCellEditor',
            flex: 1
        },
    ], []);


    // --- AgGrid 이벤트 핸들러 ---

    // 그리드 셀 값 변경 핸들러
    const handleGridCellChange = useCallback((event: any, type: 'progress' | 'resource') => {
        const { data } = event; // 변경된 행 데이터

        setFormData((prev) => {
            // (수정) 타입에 따라 올바른 listName을 지정
            const listName = type === 'progress' ? 'progressDetails' : 'humanResources';

            // (수정) prev에서 올바른 리스트를 가져오도록 수정
            const list = prev[listName] as (IProjectProgressDetail[] | IProjectHumanResource[]);

            const index = list.findIndex((item) => item.gridRowId === data.gridRowId);

            // 신규 행(isCreated)이 아닌 경우 isUpdated 플래그 설정
            const updatedItem = {
                ...data,
                isUpdated: data.isCreated !== true,
            };

            let newList;
            if (index > -1) {
                // 기존 항목 업데이트
                newList = [...list];
                newList[index] = updatedItem;
            } else {
                // 항목이 없는 경우 (거의 발생 안 함, AgGridWrapper가 'add'로 처리)
                newList = [...list, updatedItem];
            }

            return {
                ...prev,
                [listName]: newList,
            };
        });
    }, []);

    // 그리드 행 삭제 핸들러 (AgGridWrapper의 '삭제' 버튼 클릭 시)
    const handleGridDelete = (deletedRows: any[], type: 'progress' | 'resource') => {
        if (!deletedRows || deletedRows.length === 0) return;

        // (수정) listName 제거 (setFormData 내부에서 type으로 직접 처리)
        const idFieldName = type === 'progress' ? 'detailId' : 'resourceAllocationId';
        const deletedIdsListSetter = type === 'progress' ? setDeletedProgressDetails : setDeletedHumanResources;

        // 삭제할 ID 목록(DB에서 삭제 위함)
        const idsToDelete = deletedRows
            .map(row => row[idFieldName])
            .filter(id => id != null); // 신규 추가(isCreated)된 행은 ID가 없으므로 필터링

        // DB ID가 있는 행들만 삭제 목록에 추가
        if (idsToDelete.length > 0) {
            deletedIdsListSetter((prevIds) => [...prevIds, ...idsToDelete]);
        }

        // FormData 상태에서 해당 행들 제거
        setFormData((prev) => {
            const deletedGridRowIds = new Set(deletedRows.map(row => row.gridRowId));

            // ##### (수정된 부분) #####
            // type을 기준으로 분기하여 TypeScript가 타입을 명확히 추론하도록 함
            if (type === 'progress') {
                const newList = prev.progressDetails.filter(
                    item => !deletedGridRowIds.has(item.gridRowId)
                );
                return {
                    ...prev,
                    progressDetails: newList
                };
            } else { // type === 'resource'
                const newList = prev.humanResources.filter(
                    item => !deletedGridRowIds.has(item.gridRowId)
                );
                return {
                    ...prev,
                    humanResources: newList
                };
            }
            // ##### (수정 완료) #####
        });
    };

    // --- 상단 버튼 핸들러 (저장/삭제) ---

    // (수정) 탭 닫기 및 이동 핸들러 (ProjectList와 동일한 로직 필요)
    const handleSelectTab = React.useCallback(
        (tab: { key: string; label: string; path: string }) => {
            // (참고) 탭을 닫는 로직(removeTab)이 있다면 여기서 구현해야 함
            // 예제(Flora)에는 탭 닫기 로직이 없어, 리스트로 이동하는 로직만 구현
            const rootTabsData = sessionStorage.getItem('persist:rootTabs');
            if (rootTabsData) {
                const parsedData = JSON.parse(rootTabsData);
                // (수정) 'tabs' 키가 실제 persist 상태에 맞는지 확인 필요
                const cachedTabs = JSON.parse(parsedData.tabs);

                if (cachedTabs.length === 8) {
                    alert('최대 8개의 탭만 열 수 있습니다.');
                    // 탭 닫기 실패 시에도 이동은 시도
                    dispatch(setActiveTab(tab.key));
                    navigate(tab.path);
                    return;
                } else {
                    // 리스트 탭이 이미 있는지 확인
                    const listTab = cachedTabs.find((t: any) => t.key === tab.key);
                    if (!listTab) {
                        dispatch(addTab(tab));
                    }
                    dispatch(setActiveTab(tab.key));
                    navigate(tab.path);
                }
            } else {
                // 비상 처리
                dispatch(addTab(tab));
                dispatch(setActiveTab(tab.key));
                navigate(tab.path);
            }
        },
        [dispatch, navigate]
    );


    // 'Update' 버튼 핸들러
    const handleUpdate = async () => {
        if (!formData.projectId) {
            alert("프로젝트 ID가 유효하지 않습니다.");
            return;
        }

        // AgGridWrapper에서 최신 데이터 가져오기 (isCreated, isUpdated 등 포함)
        const currentProgressRows = progressGridRef.current?.getRowData() || [];
        const currentResourceRows = resourceGridRef.current?.getRowData() || [];

        // gridRowId, isUpdated 등 프론트엔드 전용 필드 제거
        const cleanGridData = (rows: any[]) => {
            return rows.map(row => {
                // (수정) row가 undefined일 경우를 대비
                if (!row) return null;
                const { gridRowId, isCreated, isUpdated, add, ...rest } = row; // AgGridWrapper의 'add' 플래그도 제거
                return rest;
            }).filter(item => item !== null); // null 제거
        };

        // 백엔드로 전송할 최종 데이터
        const dataToSave = {
            // (수정) DTO에 맞는 필드명으로 변경 (projectDescription -> description)
            ...formData,
            description: formData.projectDescription,
            // 그리드 데이터는 AgGridWrapper의 최신 상태를 반영
            progressDetails: cleanGridData(currentProgressRows),
            humanResources: cleanGridData(currentResourceRows),
            // 삭제된 ID 목록 전송 (백엔드에서 처리 방식에 따라 수정 필요)
            deletedProgressDetailIds: deletedProgressDetails,
            deletedHumanResourceIds: deletedHumanResources,
        };

        // (수정) DTO에 없는 필드(projectDescription) 제거
        delete (dataToSave as any).projectDescription;


        // (수정) 백엔드 API 명세에 따라 dataToSave 객체 구조를 맞춰야 합니다.
        // 예: Spring @RequestBody에서 deleted IDs를 별도 DTO나 Map으로 받는 경우
        console.log("Saving data:", dataToSave);

        try {
            const token = sessionStorage.getItem('authToken');
            // (수정) 백엔드 API 경로는 실제 경로에 맞게 수정해주세요.
            await axios.put(`http://localhost:8080/project/update/${formData.projectId}`, dataToSave, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("프로젝트가 성공적으로 수정되었습니다.");
            // 데이터 새로고침
            window.location.reload();

        } catch (error) {
            console.error("프로젝트 수정에 실패했습니다.", error);
            alert("프로젝트 수정 중 오류가 발생했습니다.");
        }
    };

    // 'Delete' 버튼 핸들러
    const handleDelete = async () => {
        if (!formData.projectId) {
            alert("프로젝트 ID가 유효하지 않습니다.");
            return;
        }

        if (!window.confirm("정말로 이 프로젝트를 삭제하시겠습니까? 하위 데이터가 모두 삭제됩니다.")) {
            return;
        }

        try {
            const token = sessionStorage.getItem('authToken');
            // (수정) 백엔드 API 경로는 실제 경로에 맞게 수정해주세요.
            await axios.delete(`http://localhost:8080/project/delete/${formData.projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("프로젝트가 삭제되었습니다.");

            // (수정) 현재 탭을 닫고 리스트 탭으로 이동
            // 탭 닫는 로직(removeTab)이 있다면 여기서 dispatch
            // dispatch(removeTab(key));

            // 프로젝트 리스트 탭으로 이동
            handleSelectTab({
                key: 'project-list-key', // (수정) ProjectList 탭의 고정 키
                label: '프로젝트 관리',      // (수정) ProjectList 탭의 레이블
                path: '/main/project/list', // (수정) ProjectList의 실제 경로
            });

        } catch (error) {
            console.error("프로젝트 삭제에 실패했습니다.", error);
            alert("프로젝트 삭제 중 오류가 발생했습니다.");
        }
    };

    // --- [수정] 탭 변경 시 그리드 크기 재조정 핸들러 ---
    const handleTabSelect = useCallback((key: string | null) => {
        if (!key) return;
        setActiveTabKey(key);

        // 탭이 변경되어 그리드가 표시될 때, AgGrid의 크기를 다시 계산하도록 함
        // (숨겨져 있던 그리드가 다시 나타날 때 컬럼이 깨지는 현상 방지)
        setTimeout(() => {
            if (key === 'progress') {
                progressGridRef.current?.gridApi?.sizeColumnsToFit();
            } else if (key === 'resource') {
                resourceGridRef.current?.gridApi?.sizeColumnsToFit();
            }
        }, 0);
    }, []);

    return (
        // ProjectList의 className을 참조하여 유사하게 구성
        <Container fluid className="h-100 container_bg" style={{ padding: '20px' }}>

            {/* --- 상단 헤더 --- */}
            <Row className="container_title" style={{ marginBottom: '20px' }}>
                <Col xs={6}>
                    {/* (수정) Flora 예제 스타일 참조 */}
                    <h2>프로젝트 : {formData.projectName}</h2>
                </Col>
                <Col xs={6} className="d-flex justify-content-end">
                    <Button variant="outline-danger" size="sm" style={{ marginRight: '10px' }} onClick={handleDelete}>
                        Delete
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleUpdate}>
                        Update
                    </Button>
                </Col>
            </Row>

            {/* --- 메인 컨텐츠 --- */}
            <Row className="container_contents">
                <Col>
                    {/* --- 기본 정보 폼 (이미지 참조) --- */}
                    <Form>
                        <Row>
                            <Form.Group as={Row} className="mb-3">
                                <Form.Label column sm={1}>프로젝트명</Form.Label>
                                <Col sm={6}>
                                    <Form.Control id="projectName" value={formData.projectName} onChange={handleInputChange} />
                                </Col>
                            </Form.Group>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={3}>프로젝트 코드</Form.Label>
                                    <Col sm={5}>
                                        <Form.Control id="projectCode" value={formData.projectCode} readOnly disabled />
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={3}>전체 진행률</Form.Label>
                                    <Col sm={2}>
                                        <Form.Control id="overallProgress" value={formData.overallProgress} readOnly disabled />
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={3}>프로젝트 상태</Form.Label>
                                    <Col sm={4}>
                                        <Form.Select id="projectStatus" value={formData.projectStatus} onChange={handleInputChange}>
                                            <option value="WAITING">WAITING</option>
                                            <option value="ON-TIME">ON-TIME</option>
                                            <option value="SERIOUS">SERIOUS</option>
                                            <option value="CLOSED">CLOSED</option>
                                        </Form.Select>
                                    </Col>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={3}>진행 단계</Form.Label>
                                    <Col sm={5}>
                                        <Form.Select id="step" value={formData.step} onChange={handleInputChange}>
                                            <option value="IN PLANNING">IN PLANNING</option>
                                            <option value="PREPARING">PREPARING</option>
                                            <option value="IN PROGRESS">IN PROGRESS</option>
                                            <option value="WAITING FOR ACCEPTANCE">WAITING FOR ACCEPTANCE</option>
                                            <option value="CLOSED">CLOSED</option>
                                        </Form.Select>
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={3}>담당 PM</Form.Label>
                                    <Col sm={2}>
                                        <Form.Control id="pmId" value={formData.pmId} onChange={handleInputChange} />
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={3}>기간</Form.Label>
                                    <Col sm={7}>
                                        <Row className="g-2">
                                            <Col md={6}> {/* 50% */}
                                                <Form.Control type="date" id="startDate" value={formData.startDate} onChange={handleInputChange} />
                                            </Col>
                                            <Col md={6}> {/* 50% */}
                                                <Form.Control type="date" id="endDate" value={formData.endDate} onChange={handleInputChange} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Label>상세 설명</Form.Label>
                                    {/* (수정) DTO 필드명에 맞게 id 변경 (description -> projectDescription) */}
                                    <Form.Control as="textarea" rows={3} id="projectDescription" value={formData.projectDescription} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

                    {/* --- [수정] 하단 그리드 영역을 Tabs로 변경 --- */}
                    <Row style={{ marginTop: '20px' }}>
                        <Col>
                            <Tabs
                                activeKey={activeTabKey}
                                onSelect={handleTabSelect}
                                id="project-detail-tabs"
                                className="mb-3"
                                fill
                            >
                                <Tab eventKey="progress" title="진행 상세 (Progress Details)">
                                    {/* 진행 상세 그리드 */}
                                    <AgGridWrapper
                                        ref={progressGridRef}
                                        columnDefs={progressColumns}
                                        canCreate={true}
                                        canDelete={true}
                                        canUpdate={false}
                                        showButtonArea={true}
                                        tableHeight="400px"
                                        useNoColumn={true}
                                        onCellValueChanged={(e) => handleGridCellChange(e, 'progress')}
                                        onDelete={(rows) => handleGridDelete(rows, 'progress')}
                                        enableCheckbox={true}
                                    />
                                </Tab>
                                <Tab eventKey="resource" title="투입 인력 (Human Resources)">
                                    {/* 투입 인력 그리드 */}
                                    <AgGridWrapper
                                        ref={resourceGridRef}
                                        columnDefs={resourceColumns}
                                        canCreate={true}
                                        canDelete={true}
                                        canUpdate={false}
                                        showButtonArea={true}
                                        tableHeight="400px"
                                        useNoColumn={true}
                                        onCellValueChanged={(e) => handleGridCellChange(e, 'resource')}
                                        onDelete={(rows) => handleGridDelete(rows, 'resource')}
                                        enableCheckbox={true}
                                    />
                                </Tab>
                            </Tabs>
                        </Col>
                    </Row>

                </Col>
            </Row>
        </Container>
    );
};

export default ProjectDetail;