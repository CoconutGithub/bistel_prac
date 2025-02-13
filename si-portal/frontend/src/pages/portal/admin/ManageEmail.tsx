import React, { useState, useContext, useEffect, useRef } from "react";
import { Container, Button, Row, Col, Modal, Form } from "react-bootstrap";
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "~store/Store";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import ComButton from "~pages/portal/buttons/ComButton";
import { cachedAuthToken } from "~store/AuthSlice";

interface User {
  userId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

// 컬럼 정의
const columnDefs = [
  {
    field: "sendUser",
    headerName: "보낸사람",
    sortable: true,
    filter: true,
    editable: false,
    width: 150,
  },
  {
    field: "sendReciver",
    headerName: "받는사람",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "title",
    headerName: "제목",
    sortable: true,
    filter: true,
    editable: true,
    width: 200,
  },
  {
    field: "content",
    headerName: "내용",
    sortable: true,
    filter: true,
    editable: true,
    width: 300,
  },
  {
    field: "readYn",
    headerName: "읽음여부",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: ["Y", "N"] },
  },
  {
    field: "creationTime",
    headerName: "보낸시간",
    sortable: true,
    filter: true,
  },
];

const ManageEmail: React.FC = () => {
  console.log("ManageEmail.tsx 수행됨.....");

  const comAPIContext = useContext(ComAPIContext);
  const state = useSelector((state: RootState) => state.auth);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridWrapperHandle>(null);

  useEffect(() => {}, []);

  const handleSearch = async () => {
    comAPIContext.showProgressBar();
    await new Promise((resolve) => setTimeout(resolve, 500));

    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/admin/api/get-email-history`, {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
        params: { sendUser: inputRef.current?.value || "" },
      })
      .then((res) => {
        if (gridRef.current) {
          gridRef.current.setRowData(res.data); // 데이터를 AgGridWrapper에 설정
        }
        comAPIContext.hideProgressBar();
        comAPIContext.showToast(
          comAPIContext.$msg(
            "message",
            "search_complete",
            "조회가 완료됐습니다."
          ),
          "success"
        );
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        comAPIContext.showToast("Error User Search: " + err, "danger");
      })
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <h2>{comAPIContext.$msg("menu", "manage_email", "이메일 관리")} </h2>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col lg={11}>
          <Form.Group as={Row}>
            <Form.Label column sm={1} className="text-center">
              보낸 사람
            </Form.Label>
            <Col sm={4}>
              <Form.Control
                ref={inputRef}
                type="text"
                placeholder="전송자 이름 입력"
              />
            </Col>
          </Form.Group>
        </Col>
        <Col lg={1}>
          <ComButton size="sm" variant="primary" onClick={handleSearch}>
            {comAPIContext.$msg("label", "search", "검색")}
          </ComButton>
        </Col>
      </Row>
      <Row>
        <Col>
          <AgGridWrapper
            ref={gridRef}
            showButtonArea={false}
            columnDefs={columnDefs}
            enableCheckbox={true}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ManageEmail;
