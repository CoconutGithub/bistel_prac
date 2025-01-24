import React, { useState, useContext, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper from "~components/AgGridWrapper";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~store/Store";
import RoleRegistPopup from "~pages/portal/admin/RoleRegistPopup";
import {AgGridWrapperHandle} from "~types/GlobalTypes"; // 팝업 컴포넌트 가져오기
import ComButton from '../buttons/ComButton';
import { cachedAuthToken } from "~store/AuthSlice";

const columnDefs = [
    { field: 'gridRowId', headerName: 'gridRowId', editable: false, hide: true, sortable: false, filter: false },
    { field: 'roleId', headerName: '권한 ID', sortable: true, filter: true, editable: false, width: 100 },
    {
        field: 'roleName',
        headerName: '권한 이름',
        sortable: true,
        filter: true,
        editable: true,
        width: 150,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: [] },
    },
    {
        field: 'status',
        headerName: '상태',
        sortable: true,
        filter: true,
        editable: true,
        width: 100,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
            values: ['ACTIVE', 'INACTIVE'], // 상태 값 목록
        },
    },
    { field: 'createDate', headerName: '생성일', sortable: true, filter: true, editable: false, width: 200 },
    { field: 'createBy', headerName: '생성자', sortable: true, filter: true, editable: false, width: 100 },
    { field: 'updateDate', headerName: '업데이트일', sortable: true, filter: false, width: 200 },
    { field: 'updateBy', headerName: '수정자', sortable: true, filter: true, editable: false, width: 100 },
];


interface Role {
    roleId: number | null;
    roleName: string;
    status: string;
}

interface SaveRolesPayload {
    updateList: Role[];
    deleteList: number[];
}

interface SaveRolesResponse {
    messageCode: string;
    message: string;
    updatedUsersCnt: number;
    insertedUsersCnt: number;
    deletedUsersCnt: number;
}

// let roleKind : any = null;

const ManageRole: React.FC = () => {
    const state = useSelector((state: RootState) => state.auth);

    const canCreate = useSelector((state: RootState) => state.auth.pageButtonAuth.canCreate);
    const canDelete = useSelector((state: RootState) => state.auth.pageButtonAuth.canDelete);
    const canUpdate = useSelector((state: RootState) => state.auth.pageButtonAuth.canUpdate);

    const comAPIContext = useContext(ComAPIContext);
    const gridRef = useRef<AgGridWrapperHandle>(null);

    const [roleList, setRoleList] = useState<Role[]>([]);
    const [dynamicColumnDefs, setDynamicColumnDefs] = useState(columnDefs); // 컬럼 정보
    const [showPopup, setShowPopup] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");

    console.log('ManageRole create.......')

    useEffect(() => {
        const getRoleList = async () => {
            try {
                comAPIContext.showProgressBar();

                // API 호출
                const res = await axios.get("http://localhost:8080/admin/api/get-roles-list", {
                    headers: {
                        Authorization: `Bearer ${cachedAuthToken}`,
                    },
                });

                if (res && res.data) {
                    // columnDefs 업데이트
                    console.log("Fetched Role List:", res.data);
                    setRoleList(res.data); // 상태 업데이트

                    const updatedColumnDefs: any = columnDefs.map((col) => {
                        if (col.field === 'roleName') {
                            return {
                                ...col,
                                cellEditorParams: { values: res.data.map((item: Role) => item.roleName) },
                            };
                        }
                        return col;
                    });

                    setDynamicColumnDefs(updatedColumnDefs); // 상태 업데이트
                }
            } catch (err: any) {
                console.error("Error fetching roles:", err);
                comAPIContext.showToast("Error fetching roles: " + err.message, "danger");
            } finally {
                comAPIContext.hideProgressBar();
            }
        };

        getRoleList();
    }, []);

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value === "" ? "" : parseInt(event.target.value, 10);
        setSelectedRoleId(selectedId);
    };

    const handleSearch = async () => {
        comAPIContext.showProgressBar();
        try {
            if (!roleList) {
                comAPIContext.showToast("로딩중입니다.", "warning");
                return;
            }

            const selectedRole = roleList.find((role: Role) => role.roleId === selectedRoleId);
            const roleName = selectedRole ? selectedRole.roleName : "";

            const response = await axios.get("http://localhost:8080/admin/api/get-roles", {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
                params: { roleName: roleName },
            });

            if (gridRef.current) {
                gridRef.current.setRowData(response.data);
            }

            comAPIContext.showToast("조회가 완료되었습니다.", "success");
        } catch (error: any) {
            console.error("Error fetching roles:", error);
            comAPIContext.showToast("조회 중 오류가 발생했습니다.", "danger");
        } finally {
            comAPIContext.hideProgressBar();
        }
    };

    const handleRegist = useCallback(() => {
        setShowPopup(true);
    },[]);

    const registerButton = useMemo(() => (
        <>
            <ComButton size="sm"
                className="me-2"
                variant="primary"
                onClick={handleRegist}
                disabled={!canCreate}
            >
                권한 등록
            </ComButton>
        </>
    ), []);

    const handleSave = useCallback(async (lists: { deleteList: any[]; updateList: any[] }) => {
        if (!gridRef.current) return;

        if (lists.deleteList.length === 0 && lists.updateList.length === 0) {
            comAPIContext.showToast('저장할 데이터가 없습니다.', 'dark');
            return;
        }

        try {
            comAPIContext.showProgressBar();

            const payload: SaveRolesPayload = {
                updateList: lists.updateList.map(item => ({
                    roleId: item.roleId,
                    roleName: item.roleName,
                    status: item.status,
                })),
                deleteList: lists.deleteList.map(item => item.roleId),
            };

            console.log('-----------------------:', payload);

            const response = await axios.post<SaveRolesResponse>('http://localhost:8080/admin/api/save-roles', payload, {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
            });

            console.log('Save response:', response); // 응답 확인

            comAPIContext.showToast('저장되었습니다.', 'success');
            handleSearch();
        } catch (err) {
            console.error('Error saving data:', err);
            comAPIContext.showToast('저장 중 오류가 발생했습니다.', 'danger');
        } finally {
            comAPIContext.hideProgressBar();
        }
    }, []);

    const handleDelete = (selectedRows: any[]) => {

    };

    const roleRegistButton = useMemo(() => (
        <ComButton className="me-2" onClick={handleRegist} >권한 추가</ComButton>
    ), []);

    const handleClosePopup = () => {
        setShowPopup(false);
    }

    const handleSavePopup = async(roleName: string, status: string) => {
        console.log('savePopup')
        console.log(state.user?.userName)

        try {
            comAPIContext.showProgressBar();
            const payload: SaveRolesPayload = {
                updateList: [{
                    roleId: null, // 새 역할 생성 시 roleId는 null 또는 서버에서 생성
                    roleName: roleName,
                    status: status,
                }],
                deleteList: [],
            };

            console.log('Prepared payload for savePopup:', payload); // 로그 확인

            const response = await axios.post<SaveRolesResponse>('http://localhost:8080/admin/api/save-roles', payload, {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
            });

            console.log('SavePopup response:', response); // 응답 확인

            if (response.data.messageCode === 'success') {
                const { updatedUsersCnt, insertedUsersCnt, deletedUsersCnt } = response.data;
                comAPIContext.showToast(`저장되었습니다. 업데이트된 수: ${updatedUsersCnt}, 삽입된 수: ${insertedUsersCnt}, 삭제된 수: ${deletedUsersCnt}`, 'success');
            } else {
                comAPIContext.showToast('저장 중 오류가 발생했습니다.', 'danger');
            }

            comAPIContext.hideProgressBar();
            handleSearch();
            setShowPopup(false); // 팝업 닫기
        } catch (error: any) {
            console.error('Error saving role:', error);
            comAPIContext.showToast('저장 중 오류가 발생했습니다.', 'danger');
            comAPIContext.hideProgressBar();
        }

    }

    if(roleList === null) {
        return (
        <Container fluid>
            <h2>로딩중입니다.</h2>
        </Container>
        )
    } else {
        return (
            <Container fluid>
                <Row className="mb-3">
                    <Col>
                        <h2>권한 관리</h2>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={11}>
                        <Form.Group as={Row}>
                            <Form.Label column sm={1} className="text-center">
                                권한 선택
                            </Form.Label>
                            <Col sm={2}>
                                <Form.Select onChange={handleRoleChange} value={selectedRoleId}>
                                    <option value="">옵션 선택</option>
                                    {roleList.map((role: Role) => (
                                        <option key={role.roleId ?? `new-${role.roleName}`} value={role.roleId ?? ""}>
                                            {role.roleName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Form.Group>
                    </Col>
                    <Col lg={1}>
                        <ComButton size="sm" variant="primary" onClick={handleSearch}>
                            검색
                        </ComButton>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <AgGridWrapper
                            ref={gridRef} // forwardRef를 통해 연결된 ref
                            showButtonArea={true}
                            canCreate={false}
                            canDelete={canDelete}
                            canUpdate={canUpdate}
                            columnDefs={dynamicColumnDefs}
                            enableCheckbox={true}
                            onSave={handleSave} // 저장 버튼 동작`
                        >
                        { registerButton }
                        </AgGridWrapper>
                    </Col>
                </Row>
                <RoleRegistPopup
                    show={showPopup}
                    onClose={handleClosePopup}
                    onSave={handleSavePopup} // onSave 속성 추가
                />
            </Container>
        );
    }
};

export default ManageRole;
