import { Col, Container, Row } from "react-bootstrap";
import { ComAPIContext } from "~components/ComAPIContext";
import React, { useState, useRef, useContext } from "react";
import { useSelector } from "react-redux";
import { RootState } from "~store/Store";
import ComButton from "../portal/buttons/ComButton";
import axios from "axios";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import { cachedAuthToken } from "~store/AuthSlice";
import YoonResumePopup from  './YoonResumePopup'; // 팝업 컴포넌트


// 📌 테이블 컬럼 정의
const columnDefs = [
  { headerName: "이름", field: "fullName", width: 150 },
  { headerName: "회사", field: "company", width: 200 },
  { headerName: "포지션", field: "position", width: 150 },
  { headerName: "직무", field: "jobTitle", width: 200 },
];

const YoonResume: React.FC = () => {
  const comAPIContext = useContext(ComAPIContext);
  const [showPopup, setShowPopup] = useState(false);
  const [resumeData, setResumeData] = useState<any>({});
  const gridRefResume = useRef<AgGridWrapperHandle>(null);

  // 📌 이력서 데이터 조회 API
  const handleSearch = () => {
    comAPIContext.showProgressBar();
    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/biz/yoon-resume`, {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
      })
      .then((res) => {
        if (gridRefResume.current) {
          gridRefResume.current.setRowData(res.data);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  // 📌 행 더블 클릭 시 상세 조회
  const onCellDoubleClicked = (event: any) => {
    comAPIContext.showProgressBar();
    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/biz/my/getResumeById`, {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
        params: { resumeId: event.data.id },
      })
      .then((res) => {
        setResumeData(res.data);
        setShowPopup(true);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <h2>이력서 관리</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg={12} className="d-flex justify-content-end">
          <ComButton size="sm" variant="primary" onClick={handleSearch}>
            {comAPIContext.$msg("label", "search", "검색")}
          </ComButton>
        </Col>
      </Row>
      <Row>
        <AgGridWrapper
          ref={gridRefResume}
          tableHeight="600px"
          pagination={false}
          showButtonArea={false}
          columnDefs={columnDefs}
          onCellDoubleClicked={onCellDoubleClicked}
          rowSelection="single"
        />
      </Row>
      {showPopup && (
        <YoonResumePopup show={showPopup} resumeData={resumeData} onClose={() => setShowPopup(false)} />
      )}
    </Container>
  );
};

export default YoonResume;
