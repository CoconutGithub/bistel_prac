import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { addTab, setActiveTab } from '~store/RootTabs';

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
    actualStartDate: string; // YYYY-MM-DD
    actualEndDate: string; // YYYY-MM-DD
    plannedStartDate: string; // YYYY-MM-DD
    plannedEndDate: string; // YYYY-MM-DD
    isCreated?: boolean; // 신규 행 여부
    isUpdated?: boolean; // 수정된 행 여부
}


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

    useEffect(() => {
        const fetchProjectDetail = async (projectId: number) => {
            try {
                const token = sessionStorage.getItem('authToken');

                const response = await axios.get(`http://localhost:8080/project/detail/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data;

                const formatDate = (dateStr: string | null | undefined) => {
                    if (!dateStr) return '';
                    return dateStr.split('T')[0];
                };

              const unsortedProgressDetails = (data.projectProgressDetails || []).map((item: any, index: number) => ({
                ...item,
                gridRowId: item.detailId || `temp-progress-${index}`,
              }));

              //'detailId' 기준으로 오름차순 정렬합니다.
              // detailId가 없는 신규 행(undefined)은 0으로 간주하여 맨 위로 보냅니다.
              const sortedProgressDetails = unsortedProgressDetails.sort((a: IProjectProgressDetail, b: IProjectProgressDetail) => {
                const idA = a.detailId || 0;
                const idB = b.detailId || 0;
                return idA - idB;
              });

                const formattedData: IProjectDetailData = {
                    ...data,

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
                    progressDetails: sortedProgressDetails,
                    humanResources: (data.humanResources || []).map((item: any, index: number) => ({
                        ...item,
                        actualStartDate: formatDate(item.actualStartDate),
                        actualEndDate: formatDate(item.actualEndDate),
                        plannedStartDate: formatDate(item.plannedStartDate),
                        plannedEndDate: formatDate(item.plannedEndDate),
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
        { headerName: '작업명', field: 'taskName', editable: true, flex: 1.5 },
        { headerName: '담당자', field: 'assigneeId', editable: true, flex: 1 },
        {
            headerName: '진행률(%)',
            field: 'progressPercentage',
            editable: true,
            cellEditor: 'agNumberCellEditor',
            cellRenderer: ProgressBarRenderer, // 커스텀 렌더러 사용
            flex: 1.5
        },
        {
            headerName: '가중치(%)',
            field: 'weight',
            editable: true,
            cellEditor: 'agNumberCellEditor',
            flex: 0.7
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
            headerName: '역할 (RoleID)',
            field: 'roleId',
            editable: true,
            cellEditor: 'agNumberCellEditor',
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
            headerName: '실제 투입일',
            field: 'actualStartDate',
            editable: true,
            cellEditor: 'agDateCellEditor',
            flex: 1
        },
        {
            headerName: '실제 종료일',
            field: 'actualEndDate',
            editable: true,
            cellEditor: 'agDateCellEditor',
            flex: 1
        },
        {
            headerName: '예상 투입일',
            field: 'plannedStartDate',
            editable: true,
            cellEditor: 'agDateCellEditor',
            flex: 1
        },
        {
            headerName: '예상 종료일',
            field: 'plannedEndDate',
            editable: true,
            cellEditor: 'agDateCellEditor',
            flex: 1
        },
    ], []);

  // [수정] 'resource' 탭 전용 핸들러로 변경
  const handleGridCellChange = useCallback((event: any, type: 'resource') => {
    // 'progress' 탭은 AgGridWrapper의 onSave가 처리하므로,
    // 이 핸들러는 'resource' 탭의 상태만 관리합니다.
    // (추후 'resource' 탭도 onSave로 변경 시 이 로직은 필요 없어짐)

    if (type !== 'resource') return; // 방어 코드

    const { data } = event; // 변경된 행 데이터

    setFormData((prev) => {
      const listName = 'humanResources'; // 'progress' 분기 제거
      const list = prev[listName] as IProjectHumanResource[];
      const index = list.findIndex((item) => item.gridRowId === data.gridRowId);

      const updatedItem = {
        ...data,
        isUpdated: data.isCreated !== true,
      };

      let newList;
      if (index > -1) {
        newList = [...list];
        newList[index] = updatedItem;
      } else {
        newList = [...list, updatedItem];
      }

      return {
        ...prev,
        [listName]: newList,
      };
    });
  }, []);

  // [수정] 'resource' 탭 전용 핸들러로 변경
  const handleGridDelete = (deletedRows: any[], type: 'resource') => {
    // 'progress' 탭은 AgGridWrapper의 onSave가 처리하므로,
    // 이 핸들러는 'resource' 탭의 삭제 상태만 관리합니다.

    if (type !== 'resource') return; // 방어 코드

    if (!deletedRows || deletedRows.length === 0) return;

    const idFieldName = 'resourceAllocationId'; // 'progress' 분기 제거
    const deletedIdsListSetter = setDeletedHumanResources; // 'progress' 분기 제거

    const idsToDelete = deletedRows
      .map(row => row[idFieldName])
      .filter(id => id != null);

    if (idsToDelete.length > 0) {
      deletedIdsListSetter((prevIds) => [...prevIds, ...idsToDelete]);
    }

    setFormData((prev) => {
      const deletedGridRowIds = new Set(deletedRows.map(row => row.gridRowId));

      // 'progress' 분기 제거
      const newList = prev.humanResources.filter(
        item => !deletedGridRowIds.has(item.gridRowId)
      );
      return {
        ...prev,
        humanResources: newList
      };
    });
  };

    // --- 상단 버튼 핸들러 (저장/삭제) ---
    const handleSelectTab = React.useCallback(
        (tab: { key: string; label: string; path: string }) => {
            const rootTabsData = sessionStorage.getItem('persist:rootTabs');
            if (rootTabsData) {
                const parsedData = JSON.parse(rootTabsData);
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

    // 그리드 데이터를 제외하고, 상단의 프로젝트 '기본 정보'만 전송하도록 수정
    const handleUpdate = async () => {
        if (!formData.projectId) {
            alert("프로젝트 ID가 유효하지 않습니다.");
            return;
        }

        // 백엔드로 전송할 최종 '기본 정보' 데이터
        const dataToSave = {
            projectName: formData.projectName,
            projectDescription: formData.projectDescription, // DTO 필드명(description)에 맞게 매핑
            projectStatus: formData.projectStatus,
            step: formData.step,
            pmId: formData.pmId,
            startDate: formData.startDate, // 폼의 'date' input은 이미 YYYY-MM-DD 형식
            endDate: formData.endDate,     // 폼의 'date' input은 이미 YYYY-MM-DD 형식


        };

        console.log("Saving project info:", dataToSave);

        try {
            const token = sessionStorage.getItem('authToken');

            await axios.put(`http://localhost:8080/project/update/${formData.projectId}`, dataToSave, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("프로젝트 기본 정보가 성공적으로 수정되었습니다.");

            // 데이터 새로고침
            window.location.reload();

        } catch (error: any) { // 'any' 타입을 명시하여 error 객체에 접근
            console.error("프로젝트 수정에 실패했습니다.", error);

            if (error.response) {
                // 서버가 에러 응답을 반환한 경우 (4xx, 5xx)
                const status = error.response.status;
                // 백엔드 컨트롤러가 body에 담아 보낸 에러 메시지
                const message = error.response.data || "알 수 없는 서버 오류";

                switch (status) {
                    case 403: // Forbidden (PM 권한 없음)
                        alert(`권한이 없습니다 : ${message}`);
                        break;
                    case 404: // Not Found (프로젝트 없음)
                        alert(`데이터를 찾을 수 없습니다 : ${message}`);
                        break;
                    case 500: // Internal Server Error
                        alert(`서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.`);
                        break;
                    default:
                        alert(`오류가 발생했습니다. (Status: ${status})\n${message}`);
                }
                // window.location.reload();
            } else if (error.request) {
                // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 오류 등)
                alert("서버에서 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.");
            } else {
                // 요청을 설정하는 중에 발생한 오류
                alert(`오류가 발생했습니다: ${error.message}`);
            }
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
            await axios.delete(`http://localhost:8080/project/delete/${formData.projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            alert("프로젝트가 삭제되었습니다.");

            // 프로젝트 리스트 탭으로 이동
            handleSelectTab({
                key: 'project-list-key',
                label: '프로젝트 관리',
                path: '/main/project/list',
            });

        } catch (error: any) { // 'any' 타입을 명시하여 error 객체에 접근
            console.error("프로젝트 삭제에 실패했습니다.", error);

            if (error.response) {
                const status = error.response.status;
                const message = error.response.data || "알 수 없는 서버 오류";

                switch (status) {
                    case 403: // Forbidden (PM 권한 없음)
                        alert(`권한이 없습니다 : ${message}`);
                        break;
                    case 404: // Not Found (프로젝트 없음)
                        alert(`데이터를 찾을 수 없습니다 : ${message}`);
                        break;
                    case 500: // Internal Server Error
                        alert(`서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.`);
                        break;
                    default:
                        alert(`오류가 발생했습니다. (Status: ${status})\n${message}`);
                }
                // window.location.reload();
            } else if (error.request) {
                // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 오류 등)
                alert("서버에서 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.");
            } else {
                // 요청을 설정하는 중에 발생한 오류
                alert(`오류가 발생했습니다: ${error.message}`);
            }
        }
    };

  const handleProgressSave = async (lists: {
    deleteList: any[];
    updateList: any[];
    createList: any[];
  }) => {
    const { createList, updateList, deleteList } = lists;

    if (createList.length === 0 && updateList.length === 0 && deleteList.length === 0) {
      alert('저장할 변경 내용이 없습니다.');
      return;
    }

    // 백엔드로 보낼 데이터. projectId를 포함해야 합니다.
    const payload = {
      createList,
      updateList,
      deleteList
    };

    console.log("Saving Progress Details:", payload);

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.post(`http://localhost:8080/project/progress/save/${formData.projectId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('진행 상세 정보가 성공적으로 저장되었습니다.');
      // 저장이 성공하면, 그리드 데이터를 새로고침
      window.location.reload();

    } catch (error: any) {
      console.error("진행 상세 저장에 실패했습니다.", error);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || "알 수 없는 서버 오류";
        switch (status) {
          case 400:alert(`저장 실패: ${message}`);break;//(가중치합이 !100)
          case 403: alert(`권한이 없습니다 : ${message}`); break; // (PM 권한)
          case 404: alert(`데이터를 찾을 수 없습니다 : ${message}`); break; // (프로젝트가 없음)
          case 500: alert(`서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.`); break;
          default: alert(`오류가 발생했습니다. (Status: ${status})\n${message}`);
        }
      } else {
        alert("서버 응답 오류. 네트워크를 확인해주세요.");
      }
    }
  };

    // --- [수정] 탭 변경 시 그리드 크기 재조정 핸들러 ---
    const handleTabSelect = useCallback((key: string | null) => {
        if (!key) return;
        setActiveTabKey(key);

        // 탭이 변경되어 그리드가 표시될 때, AgGrid의 크기를 다시 계산하도록 함
        setTimeout(() => {
            if (key === 'progress') {
                progressGridRef.current?.gridApi?.sizeColumnsToFit();
            } else if (key === 'resource') {
                resourceGridRef.current?.gridApi?.sizeColumnsToFit();
            }
        }, 0);
    }, []);

    return (
        <Container fluid className="h-100 container_bg" style={{ padding: '20px' }}>

            {/* --- 상단 헤더 --- */}
            <Row className="container_title" style={{ marginBottom: '20px' }}>
                <Col xs={6}>
                    <h2>프로젝트 : {formData.projectName}</h2>
                </Col>
                <Col xs={6} className="d-flex justify-content-end">
                    <Button variant="outline-danger" size="sm" style={{ marginRight: '10px' }} onClick={handleDelete}>
                        프로젝트 삭제
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleUpdate}>
                        수정
                    </Button>
                </Col>
            </Row>

            {/* --- 메인 컨텐츠 --- */}
            <Row className="container_contents">
                <Col>
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
                                    <Col sm={4}>
                                        <Form.Control id="pmId" value={formData.pmId} onChange={handleInputChange} />
                                    </Col>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group as={Row} className="mb-3">
                                    <Form.Label column sm={3}>기간</Form.Label>
                                    <Col sm={8}>
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
                                    <Form.Control as="textarea" rows={3} id="projectDescription" value={formData.projectDescription} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>

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
                                        canUpdate={true}
                                        showButtonArea={true}
                                        tableHeight="400px"
                                        useNoColumn={true}
                                        onSave={handleProgressSave}
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