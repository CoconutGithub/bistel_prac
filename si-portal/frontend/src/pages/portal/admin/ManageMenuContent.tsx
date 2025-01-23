import React, {useEffect, useMemo, useRef, useState, useContext} from "react";
import {Col, Container, Form, Row} from "react-bootstrap";
import { ChooseMenuData } from "~types/ChooseMenuData";
import AgGridWrapper from "~components/AgGridWrapper";
import { AgGridWrapperHandle } from "~types/GlobalTypes"
import ComButton from "~pages/portal/buttons/ComButton";
import RoleRegistPopup from "~pages/portal/admin/RoleRegistPopup";
import { RootState } from "~store/Store";
import { useSelector } from "react-redux";
import { ComAPIContext } from "~components/ComAPIContext";
import axios from "axios";
import { cachedAuthToken } from "~store/AuthSlice";

interface ManageMenuContentProps {
    chooseMenuData : ChooseMenuData | null;
}

interface Role {
    roleId: number;
    roleName: string;
}

let columnDefs = [
    { field: 'roleName', headerName: '권한 이름', cellEditor: 'agSelectCellEditor', sortable: true, filter: true, editable: true, width: 150 },
    { field: 'canCreate', headerName: '생성 권한',
        cellDataType: 'boolean',
        valueGetter: (params: any) => {
            return params.data.canCreate === 'Y' ? true : false;
        },
        valueSetter: (params: any) => {
            const newValue: boolean = params.newValue;
            params.data.canCreate = newValue ? 'Y' : 'N';
            return true;
        },
        sortable: true, filter: true, editable: true, width: 150 },
    {
        field: 'canRead',
        headerName: '읽기 권한',
        cellDataType: 'boolean',
        valueGetter: (params: any) => {
            return params.data.canRead === 'Y' ? true : false;
        },
        valueSetter: (params: any) => {
            const newValue: boolean = params.newValue;
            params.data.canRead = newValue ? 'Y' : 'N';
            return true;
        },
        sortable: true,
        filter: true,
        editable: true,
        width: 150
    },
    { field: 'canUpdate', headerName: '업데이트 권한',
        cellDataType: 'boolean',
        valueGetter: (params: any) => {
            return params.data.canUpdate === 'Y' ? true : false;
        },
        valueSetter: (params: any) => {
            const newValue: boolean = params.newValue;
            params.data.canUpdate = newValue ? 'Y' : 'N';
            return true;
        },
        sortable: true, filter: true, editable: true, width: 150 },
    { field: 'canDelete', headerName: '삭제 권한',
        cellDataType: 'boolean',
        valueGetter: (params: any) => {
            return params.data.canDelete === 'Y' ? true : false;
        },
        valueSetter: (params: any) => {
            const newValue: boolean = params.newValue;
            params.data.canDelete = newValue ? 'Y' : 'N';
            return true;
        },
        sortable: true, filter: true, editable: true, width: 150 },
    { field: 'createDate', headerName: '생성일', sortable: true, filter: true, editable: false, width: 150 },
    { field: 'createBy', headerName: '생성자', sortable: true, filter: true, editable: false, width: 100 },
    { field: 'updateDate', headerName: '업데이트일', sortable: true, filter: false, width: 150 },
    { field: 'updateBy', headerName: '수정자', sortable: true, filter: true, editable: false, width: 100 },
];

const ManageMenuContent: React.FC<ManageMenuContentProps> = ({ chooseMenuData }) => {

    console.log("ManageMenuContent 생성됨.");

    const [isActive, setIsActive] = useState<string>('INACTIVE');
    const gridRef = useRef<AgGridWrapperHandle>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [position, setPosition] = useState<number|any>(chooseMenuData?.position);
    const [path, setPath] = useState<string|any>(chooseMenuData?.path);
    const [menuName, setMenuName] = useState<string|any>(chooseMenuData?.menuName);
    const state = useSelector((state: RootState) => state.auth);
    const comAPIContext = useContext(ComAPIContext);
    const pathRef = useRef<HTMLInputElement>(null);
    const menuNameRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        
        console.log("====>", chooseMenuData)
        
        setPosition(Number(chooseMenuData?.position));
        setPath(chooseMenuData?.path);
        setMenuName(chooseMenuData?.menuName);
        setIsActive(chooseMenuData?.status ?? 'INACTIVE');
        
        fetchData();

    }, [chooseMenuData]);

    const fetchData = async () => {
        try {
            comAPIContext.showProgressBar();
            const res = await axios.get<Role[]>("http://localhost:8080/admin/api/get-roles-list", {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                }
            });

            columnDefs = columnDefs.map((col) => {
                if (col.field === 'roleName') {
                  return {
                    ...col,
                    cellEditorParams: { values: res.data.map((item:any) => item.roleName) },
                  };
                }
                return col; // 반드시 반환
              });
        } catch (error: any) {
            console.error("Error fetching roles:", error);
            const errorMessage = error.response?.data || error.message || "Unknown error";
            comAPIContext.showToast("Error fetching roles: " + errorMessage, "danger");
        } finally {
            comAPIContext.hideProgressBar();
        }
    };

    const handleSave = async () => {
        console.log('추가된 메뉴 저장') // 화면 랜더링 필요 메뉴 해더, 메뉴, 
        console.log(chooseMenuData)

        const pathValue = pathRef?.current?.value;  // ref로 저장된 값을 가져옴
        console.log('저장된 메뉴 경로:', pathValue);

        const menuNameValue = menuNameRef?.current?.value;
        console.log('변경된 이름:', menuNameValue)

        console.log(pathRef)

        console.log(state.user?.userId)

        const data = {
            menuName: menuNameValue,
            path: pathValue,  
            position: position,
            status: isActive,
            userId: state.user?.userId,
            menuId: chooseMenuData?.menuId,
        }

        console.log(data)

        try {
            comAPIContext.showProgressBar();
            const res = await axios.post('http://localhost:8080/admin/api/update-menu-content', data ,{
              headers: { Authorization: `Bearer ${cachedAuthToken}` },
            });
      
            console.log(res);
            comAPIContext.hideProgressBar();
            alert('Save successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            comAPIContext.hideProgressBar();
            alert('Failed to send email');
        }

    };

    const handleGridSave = () => {

    };

    const handleMenuName = () => {

    };

    const handleMenuPath = () => {
        
    };

    const handleRegist = () => {
        console.log('Role 추가 Button:', )
        setShowPopup(true);
    };

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
              headers: { Authorization: `Bearer ${cachedAuthToken}` },
            });
      
            console.log(response);
            comAPIContext.hideProgressBar();
            alert('Save successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email');
        }

    }

    const roleRegistButton = useMemo(() => (
        <ComButton className="me-3" onClick={handleRegist} >Role추가</ComButton>
    ), []);

    return (
        <Container fluid className="p-4">
            {chooseMenuData && chooseMenuData.menuName !== 'Root' ? (
                <>
                    <h4 className="mb-4">{chooseMenuData.isAdd === true ? 'Add Menu' : 'Selected Menu'}</h4>
                    <Form>
                        {/* Menu ID */}
                        <Form.Group as={Row} className="align-items-center mb-2">
                            <Form.Label column sm={2}>
                                Menu ID:
                            </Form.Label>
                            <Col sm={4}>
                                <Form.Control
                                    type="text"
                                    value={chooseMenuData.menuId}
                                    size="sm"
                                    disabled
                                    readOnly
                                />
                            </Col>
                        </Form.Group>
                        {/* Parent Menu ID */}
                        <Form.Group as={Row} className="align-items-center mb-2">
                            <Form.Label column sm={2}>
                                Parent Menu ID:
                            </Form.Label>
                            <Col sm={4}>
                                <Form.Control
                                    type="text"
                                    value={chooseMenuData.parentMenuId}
                                    size="sm"
                                    disabled
                                    readOnly
                                />
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="align-items-center mb-2">
                            <Form.Label column sm={2}>
                                Position:
                            </Form.Label>
                            <Col sm={4}>
                                <Form.Control
                                    type="number"
                                    value={position || 0}
                                    onChange={(e) => setPosition(e.target.value)} 
                                    max={9999}
                                    size="sm"
                                />
                            </Col>
                        </Form.Group>

                        {/* Menu Name */}
                        <Form.Group as={Row} className="align-items-center mb-2">
                            <Form.Label column sm={2}>
                                Menu Name:
                            </Form.Label>
                            <Col sm={4}>
                                <Form.Control
                                    type="text"
                                    ref={menuNameRef}  // ref로 직접 접근
                                    defaultValue={menuName || ''}
                                    size="sm"
                                    style={{
                                        backgroundColor: "#f0f8ff", // 연한 파란색
                                    }}
                                    onChange={handleMenuName}
                                />
                            </Col>
                        </Form.Group>

                        {/* Menu Path */}
                        <Form.Group as={Row} className="align-items-center mb-2">
                            <Form.Label column sm={2}>
                                Menu Path:
                            </Form.Label>
                            <Col sm={4}>
                            <Form.Control
                                type="text"
                                ref={pathRef}  // ref로 직접 접근
                                defaultValue={path || ''}  // ref를 사용해 입력값을 관리
                                size="sm"
                                style={{
                                    backgroundColor: "#f0f8ff", // 연한 파란색
                                }}
                            />
                            </Col>
                        </Form.Group>

                        {/* Status */}
                        <Form.Group as={Row} className="align-items-center mb-2">
                            <Form.Label column sm={2}>
                                Status:
                            </Form.Label>
                            <Col sm={4}>
                                <div>
                                    <Form.Check
                                        type="switch"
                                        id="custom-switch"
                                        label={isActive ? 'Active ON' : 'Active OFF'}
                                        checked={isActive === 'INACTIVE' ? false : true}
                                        onChange={() => {
                                            const newValue = isActive === 'INACTIVE' ? true : false;
                                            const status = newValue ? 'ACTIVE' : 'INACTIVE';
                                            setIsActive(status);
                                        }}
                                    />
                                </div>
                            </Col>
                        </Form.Group>
                        {/* 저장 버튼 */}
                        <Form.Group as={Row} className="mt-4">
                            <Col sm={{span: 4, offset: 2}}>
                                <ComButton onClick={handleSave}>저장</ComButton>
                            </Col>
                        </Form.Group>
                    </Form>
                    <h4 className="mt-4">Role</h4>
                    <div>
                        <AgGridWrapper
                            ref={gridRef}
                            showButtonArea={true}
                            columnDefs={columnDefs}
                            enableCheckbox={true}
                            onSave={handleGridSave}
                        >
                            {roleRegistButton}
                        </AgGridWrapper>
                    </div>
                </>
            ) : (
                <div>
                    <h5>No Menu Selected</h5>
                    <p>Please select a menu to see the details.</p>
                </div>
            )}
            <RoleRegistPopup
                show={showPopup}
                onClose={handleClosePopup}
                onSave={handleSavePopup}
                />
        </Container>
    );
};

export default ManageMenuContent;
