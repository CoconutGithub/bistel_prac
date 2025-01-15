import React, {useState, useEffect, useContext, useRef} from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AgGridWrapper, {AgGridWrapperHandle} from '~components/AgGridWrapper';
import { useSelector  } from 'react-redux';
import { ComAPIContext } from "~components/ComAPIContext";
import axios from "axios";
import {RootState} from "~store/Store";

interface User {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

// 컬럼 정의
const columnDefs = [
  { field: 'gridRowId', headerName: 'gridRowId', editable: false, hide: true },
  { field: 'userId', headerName: 'ID', sortable: true, filter: true, editable: false, width: 100 },
  { field: 'userName', headerName: '이름', sortable: true, filter: true, editable: true, width: 150 },
  { field: 'email', headerName: '이메일', sortable: true, filter: true, editable: true, width: 250 },
  { field: 'phoneNumber', headerName: '전화번호', sortable: true, filter: true, editable: true, width: 300 },
  { field: 'roleName'
    , headerName: '역할'
    , sortable: true
    , filter: true
    , editable: true
    , width: 150
    , cellEditor: 'agSelectCellEditor' // Combobox 설정
    , cellEditorParams: { values: ['SA', 'ADMIN', 'USER'] }// Combobox 옵션
  },
  { field: 'roleId', headerName: 'roleId', hide: true },
  { field: 'status'
    , headerName: '상태'
    , sortable: true
    , filter: true
    , editable: true
    , width: 100
    , cellEditor: 'agSelectCellEditor' // Combobox 설정
    , cellEditorParams: { values: ['ACTIVE', 'INACTIVE'] }// Combobox 옵션
  },
  { field: "createDate", headerName: "생성일", sortable: true, filter: true },
  { field: "updateDate", headerName: "수정일", sortable: true, filter: true },
  { field: "updateBy", headerName: "수정자", sortable: true, filter: true },
];

const ManageUser: React.FC = () => {
  console.log("ManageUser 생성됨.");

  //==start: 여기는 무조건 공통으로 받는다고 생각하자
  const state = useSelector((state: RootState) => state.auth);
  const comAPIContext = useContext(ComAPIContext);
  //==end: 여기는 무조건 공통으로 받는다고 생각하자

  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridWrapperHandle>(null);


  useEffect(() => {
  }, []);



  const handleSearch = async() => {
    comAPIContext.showProgressBar();
    await new Promise((resolve) => setTimeout(resolve, 500))

    axios.get("http://localhost:8080/admin/api/get-user",
        {
          headers: { Authorization: `Bearer ${state.authToken}` },
          params: { 'userName' : inputRef.current?.value || ''},
        })
        .then((res) => {
          if (gridRef.current) {
            gridRef.current.setRowData(res.data); // 데이터를 AgGridWrapper에 설정
          }
          comAPIContext.hideProgressBar();
          comAPIContext.showToast('조회가 완료됐습니다.','dark');
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          comAPIContext.showToast("Error User Search: "+ err, "danger");
        })
        .finally(() =>{
          comAPIContext.hideProgressBar();
        });
  };

  const handleSave = async (lists: { deleteList: any[]; updateList: any[] }) => {

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

      await axios.post('http://localhost:8080/admin/api/update-user', payload, {
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
  };


  return (
      <Container fluid>
        <Row className="mb-3">
          <Col>
            <h2>사용자 관리</h2>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col lg={11}>
            <Form.Group as={Row}>
              <Form.Label column sm={1} className="text-center">
                사용자 이름
              </Form.Label>
              <Col sm={2}>
                <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="사용자 이름 입력"
                />
              </Col>
            </Form.Group>
          </Col>
          <Col lg={1}>
            <Button size="sm" variant="primary" onClick={handleSearch}>
              검색
            </Button>
          </Col>
        </Row>
        <div style={{ borderTop: '1px solid black', margin: '15px 0' }}></div>
        <Row>
          <Col>
            <AgGridWrapper
                ref={gridRef} // forwardRef를 통해 연결된 ref
                showButtonArea={true}
                columnDefs={columnDefs}
                enableCheckbox={true}
                onSave={handleSave} // 저장 버튼 동작
            />
          </Col>
        </Row>
      </Container>
  );
};

export default ManageUser;
