import { Col, Container, Row } from 'react-bootstrap';
import { ComAPIContext } from '~components/ComAPIContext';
import React, { useState, useRef, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '~store/Store';
import ComButton from '../portal/buttons/ComButton';
import CshResumePopup from './CshResumePopup';
import axios from 'axios';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import { cachedAuthToken } from '~store/AuthSlice';

const columResume = [
  { headerName: 'ID', field: 'id', width: 100 },
  { headerName: '이름', field: 'fullName', width: 150 },
  { headerName: '요약', field: 'summary', width: 300 },
  { headerName: '경력', field: 'carrierMonth', width: 100 },
  { headerName: 'Email', field: 'email', width: 250 },
  { headerName: 'Phone', field: 'phone', width: 200 },
  { headerName: '셩별', field: 'gender', width: 100 },
];

interface CshResumeProps {}

const CshResume: React.FC<CshResumeProps> = () => {
  const comAPIContext = useContext(ComAPIContext);
  const [showPopup, setShowPopup] = useState(false);
  const [resumeData, setResumeData] = useState<any>({});
  const canCreate = useSelector(
    (state: RootState) => state.auth.pageButtonAuth.canCreate
  );
  const gridRefResume = useRef<AgGridWrapperHandle>(null);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSearch = () => {
    comAPIContext.showProgressBar();
    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/biz/csh/getResumeList`, {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
      })
      .then((res) => {
        if (gridRefResume.current) {
          gridRefResume.current.setRowData(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  const onCellDoubleClicked = (event: any) => {
    comAPIContext.showProgressBar();

    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/biz/csh/getResumeById`, {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
        params: { resumeId: event.data.id },
      })
      .then((res) => {
        setResumeData(res.data);
        handleOpenPopup();
      })
      .catch((err) => {})
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  const setResumData = () => {};

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <h2>이력서관리</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg={12} className="d-flex justify-content-end">
          <ComButton size="sm" variant="primary" onClick={handleSearch}>
            {comAPIContext.$msg('label', 'search', '검색')}
          </ComButton>
        </Col>
      </Row>
      <Row>
        <AgGridWrapper
          ref={gridRefResume}
          tableHeight="600px"
          pagination={false}
          showButtonArea={false}
          columnDefs={columResume}
          onCellDoubleClicked={onCellDoubleClicked}
          enableCheckbox={true}
          rowSelection="single"
        />
      </Row>
      {showPopup && (
        <CshResumePopup
          show={showPopup}
          resumeData={resumeData}
          onClose={handleClosePopup}
        />
      )}
    </Container>
  );
};

export default CshResume;
