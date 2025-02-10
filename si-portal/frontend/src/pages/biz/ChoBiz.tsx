import { Container, Button, Modal, Form } from 'react-bootstrap';
import { ComAPIContext } from "~components/ComAPIContext";
import React, { useState, useRef, useContext } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "~store/Store";
import axios from 'axios';
import ComButton from '../portal/buttons/ComButton';
import {cachedAuthToken} from "~store/AuthSlice";

const ChoBiz: React.FC = () => {

  const choClick = () => {
    alert("click...");
  }

  const canCreate = useSelector((state: RootState) => state.auth.pageButtonAuth.canCreate);
  const canDelete = useSelector((state: RootState) => state.auth.pageButtonAuth.canDelete);
  const canUpdate = useSelector((state: RootState) => state.auth.pageButtonAuth.canUpdate);
  const canRead = useSelector((state: RootState) => state.auth.pageButtonAuth.canRead);

  return (
      <Container className="mt-5">
        {/* 생성 버튼 */}
        <ComButton className="ms-3" disabled={!canCreate} variant="primary" onClick={choClick}>
          생성
        </ComButton>
        {/* 삭제 버튼 */}
        <ComButton className="ms-3" disabled={!canDelete} variant="primary" onClick={choClick}>
          삭제
        </ComButton>
        {/* 수정 버튼 */}
        <ComButton className="ms-3" disabled={!canUpdate} variant="primary" onClick={choClick}>
          수정
        </ComButton>
        {/* 조회 버튼 */}
        <ComButton className="ms-3" disabled={!canRead} variant="primary" onClick={choClick}>
          조회
        </ComButton>
      </Container>
  );
}

export default ChoBiz;
