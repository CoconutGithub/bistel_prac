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

const columnDefs = [
    { field: 'gridRowId', headerName: 'gridRowId', editable: false, hide: true },
    { field: 'roleId', headerName: '권한 ID', sortable: true, filter: true, editable: false, width: 100 },
    { field: 'roleName', headerName: '권한 이름', sortable: true, filter: true, editable: false, width: 150 },
    { field: 'createDate', headerName: '생성일', sortable: true, filter: true, editable: false, width: 200 },
    { field: 'createBy', headerName: '생성자', sortable: true, filter: true, editable: false, width: 100 },
    { field: 'updateDate', headerName: '업데이트일', sortable: true, filter: false, width: 200 },
    { field: 'updateBy', headerName: '수정자', sortable: true, filter: true, editable: false, width: 100 },
];

interface Role {
    roleId: number;
    roleName: string;
}

const ManageRole: React.FC = () => {
    const state = useSelector((state: RootState) => state.auth);
    const comAPIContext = useContext(ComAPIContext);
    const gridRef = useRef<AgGridWrapperHandle>(null);

    const [roleList, setRoleList] = useState<Role[]>([]);
    const [showPopup, setShowPopup] = useState(false);

    let selectedRoleName = '';

    console.log('ManageRole create.......')

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            comAPIContext.showProgressBar();
            const res = await axios.get<Role[]>("http://localhost:8080/admin/api/get-roles-list", {
                headers: {
                    Authorization: `Bearer ${state.authToken}`,
                }
            });
            setRoleList(res.data); // 역할 목록 상태 업데이트
        } catch (error: any) {
            console.error("Error fetching roles:", error);
            const errorMessage = error.response?.data || error.message || "Unknown error";
            comAPIContext.showToast("Error fetching roles: " + errorMessage, "danger");
        } finally {
            comAPIContext.hideProgressBar();
        }
    };
    

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {

        //[old]
        // const selectedRoleId = parseInt(event.target.value, 10);
        // const selectedRole = roleList.find(role => role.roleId === selectedRoleId);
        // if (selectedRole) {
        //     setRoleRef(selectedRole.roleName); // 선택된 role을 roleRef에 저장
        //     console.log('Selected Role:', selectedRole.roleName); // 선택된 role을 확인
        // }
        //[new]
        const selectedRoleId = parseInt(event.target.value, 10);
        const selectedRole = roleList.find(role => role.roleId === selectedRoleId);
        if (selectedRole) {
            selectedRoleName = selectedRole.roleName;
        }



    };

    const handleSearch = async () => {
        comAPIContext.showProgressBar();
        try {
            console.log('selectedRoleName:', selectedRoleName);
            const response = await axios.get("http://localhost:8080/admin/api/get-roles", {
                headers: {
                    Authorization: `Bearer ${state.authToken}`,
                },
                params: { 'roleName': selectedRoleName },
            });

            console.log(response)
            if (gridRef.current) {
                gridRef.current.setRowData(response.data);
            }
            comAPIContext.showToast("조회가 완료되었습니다.", "success");
        } catch (error: any) {
            console.error("Error fetching roles:", error);
            const errorMessage = error.response?.data || error.message || "Unknown error";
            comAPIContext.showToast("Error fetching roles: " + errorMessage, "danger");
        } finally {
            comAPIContext.hideProgressBar();
        }
    }

    const handleSave = useCallback(async (lists: { deleteList: any[]; updateList: any[] }) => {

        if (!gridRef.current) return;
    
        if (lists.deleteList.length === 0 && lists.updateList.length === 0) {
          comAPIContext.showToast('저장할 데이터가 없습니다.', 'dark');
          return;
        }
    
    
        try {
          comAPIContext.showProgressBar();
          console.log('1.update 행들:', lists);
          console.log('2.delete 행들:', lists);
    
          // 전송 데이터 구성
          const payload = {
            updateList: lists.updateList,
            deleteList: lists.deleteList,
          };
    
          await axios.post('http://localhost:8080/admin/api/update-permission', payload, {
            headers: { Authorization: `Bearer ${state.authToken}` },
          });
    
          comAPIContext.showToast('저장되었습니다.', 'success');
          handleSearch(); // 저장 후 최신 데이터 조회
        } catch (err) {
          console.error('Error saving data:', err);
          comAPIContext.showToast('저장 중 오류가 발생했습니다.', 'danger');
          handleSearch();
        } finally {
          comAPIContext.hideProgressBar();
        }
      }, []);

    const handleDelete = (selectedRows: any[]) => {
        // 삭제 처리
        console.log("Deleting rows", selectedRows);
    };

    const handleRegist = useCallback(() => {
        setShowPopup(true);
    },[]);

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
            const response = await axios.post('http://localhost:8080/admin/api/save-role',
            {
                userName: state.user?.userName,
                roleName: roleName,
                status: status,
            }
            ,{
              headers: { Authorization: `Bearer ${state.authToken}` },
            });
      
            console.log(response);
            comAPIContext.hideProgressBar();
            alert('Save successfully!');
            fetchData();
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email');
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
                                <Form.Select onChange={handleRoleChange}>
                                    <option value="">Select an option</option>
                                    {roleList.map((role) => (
                                        <option key={role.roleId} value={role.roleId}>
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
                <div style={{ borderTop: '1px solid black', margin: '15px 0' }}></div>
                <Row>
                    <Col>
                        <AgGridWrapper
                            ref={gridRef}
                            showButtonArea={true}
                            columnDefs={columnDefs}
                            enableCheckbox={true}
                            onSave={handleSave}
                        >
                        { roleRegistButton }
                        </AgGridWrapper>
                    </Col>
                </Row>
                <RoleRegistPopup
                    show={showPopup}
                    onClose={handleClosePopup}
                    onSave={handleSavePopup}
                />
            </Container>
        );
    }
};

export default ManageRole;
