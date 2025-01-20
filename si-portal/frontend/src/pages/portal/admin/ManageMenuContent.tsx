import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Col, Container, Form, Row} from "react-bootstrap";
import { ChooseMenuData } from "~types/ChooseMenuData";
import AgGridWrapper from "~components/AgGridWrapper";
import { AgGridWrapperHandle } from "~types/GlobalTypes"
import ComButton from "~pages/portal/buttons/ComButton";

interface ManageMenuContentProps {
    chooseMenuData : ChooseMenuData | null;
}

const columnDefs = [
    { field: 'roleName', headerName: '권한 이름', sortable: true, filter: true, editable: false, width: 150 },
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

    const [isActive, setIsActive] = useState<boolean>(true);
    const gridRef = useRef<AgGridWrapperHandle>(null);

    useEffect(() => {

        console.log("====>", chooseMenuData)

        chooseMenuData?.status === 'ACTIVE' ? setIsActive(true) : setIsActive(false);

    }, [chooseMenuData]);

    const handleSave = () => {

    };

    const handleGridSave = () => {

    };

    const handleMenuName = () => {

    };

    const handleMenuPath = () => {

    };

    const handleRegist = () => {
    };

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
                                    readOnly
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
                                    value={chooseMenuData.menuName}
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
                                    value={chooseMenuData.path}
                                    size="sm"
                                    style={{
                                        backgroundColor: "#f0f8ff", // 연한 파란색
                                    }}
                                    onChange={handleMenuPath}
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
                                        checked={isActive}
                                        onChange={() => setIsActive(!isActive)}
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
        </Container>
    );
};

export default ManageMenuContent;
