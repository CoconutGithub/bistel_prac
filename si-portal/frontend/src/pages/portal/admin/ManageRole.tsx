
import React, {useState, useContext, useEffect, useCallback, useRef} from 'react';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper, {AgGridWrapperHandle} from "~components/AgGridWrapper";
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";


interface Role {
    roleId: string;
    roleName: string;
}


// 컬럼 정의
const columnDefs = [
    { field: 'roleId', headerName: '권한 ID', sortable: true, filter: true, editable: false, width: 100 },
    { field: 'roleName'
        , headerName: '권한 이름'
        , sortable: true
        , filter: true
        , editable: true
        , width: 150
        , cellEditor: 'agSelectCellEditor' // Combobox 설정
        , cellEditorParams: { values: ['SA', 'ADMIN', 'USER'] }// Combobox 옵션
    },
    { field: 'status'
        , headerName: '상태'
        , sortable: true
        , filter: true
        , editable: true
        , width: 100
        , cellEditor: 'agSelectCellEditor' // Combobox 설정
        , cellEditorParams: { values: ['ACTIVE', 'INACTIVE'] }// Combobox 옵션
    },
    { field: 'menu', headerName: '메뉴명', sortable: true, filter: true, editable: false, width: 300 },
    { field: 'canCreate', headerName: '생성가능', sortable: true, filter: true, editable: false,  },
    { field: 'canRead', headerName: '조회 가능', sortable: true, filter: true, editable: false, width: 150 },
    { field: 'canUpdate', headerName: '수정 가능', sortable: true, filter: true, editable: false, width: 150 },
    { field: 'canDelete', headerName: '삭제 가능', sortable: true, filter: true, editable: false, width: 150 },
    { field: "createDate", headerName: "생성일", sortable: true, width: 150, filter: true },
];



const ManageRole: React.FC = () => {

    console.log("ManageMenu 생성");
    const state = useSelector((state: RootState) => state.auth);
    const comAPIContext = useContext(ComAPIContext);

    const gridRef = useRef<AgGridWrapperHandle>(null);

    const [comboData, setComboData] = useState<Role[]>([]); // 콤보박스 데이터 상태
    const [selectedOption, setSelectedOption] = useState<string | undefined>('');


    // 1. 초기 마운트 시 콤보박스 데이터를 가져오는 useEffect
    useEffect(() => {
        const fetchComboData = async () => {
            // DB에서 데이터를 가져오는 API 호출 (여기서는 Mock Data로 처리)
            const data = await new Promise<Role[]>((resolve) =>
                setTimeout(() => resolve([{ 'roleId': '1', 'roleName': 'Option 1' }, { 'roleId': '2', 'roleName': 'Option 2' }]), 1000)
            );
            setComboData(data);
        };

        fetchComboData();
    }, []); // 빈 배열로 설정 -> 컴포넌트 마운트 시 한 번만 실행


    // handleSearch를 useCallback으로 정의
    const handleSearch = useCallback(() => {
        return '';
    }, []);

    // handleSearch를 useCallback으로 정의
    const handleDelete = useCallback(() => {
        return '';
    }, []);

    // handleSearch를 useCallback으로 정의
    const handleSave = useCallback(() => {
        return '';
    }, []);


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
                            <Form.Select
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            >
                                <option value="">Select an option</option>
                                {comboData.map((item) => (
                                    <option key={item.roleId} value={item.roleName}>
                                        {item.roleName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                </Col>
                <Col lg={1}>
                    <Button size="sm" variant="primary" onClick={handleSearch}>
                        검색
                    </Button>
                </Col>
            </Row>
            <div style={{borderTop: '1px solid black', margin: '15px 0'}}></div>
            <Row>
                <Col>
                    <AgGridWrapper
                        ref={gridRef} // forwardRef를 통해 연결된 ref
                        showButtonArea={true}
                        columnDefs={columnDefs}
                        enableCheckbox={true}
                        onDelete={handleDelete} // 삭제 핸들러 전달
                        onSave={handleSave} // 저장 버튼 동작
                    />
                </Col>
            </Row>
        </Container>
    );
};

export default ManageRole;
