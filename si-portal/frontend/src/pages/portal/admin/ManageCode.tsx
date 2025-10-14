import React, { useState, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ChooseCodeData } from '@/types/ChooseCodeData';
import ManageCodeTree from '~pages/portal/admin/ManageCodeTree';
import ManageCodeContent from '~pages/portal/admin/ManageCodeContent';
import { ComAPIContext } from '~components/ComAPIContext';

const ManageCode: React.FC = () => {
  const comAPIContext = useContext(ComAPIContext);
  const [chooseCodeData, setChooseCodeData] = useState<ChooseCodeData | null>(
    null
  );
  const [refreshTree, setRefreshTree] = useState(false);

  const handleRefreshTree = () => {
    setRefreshTree((prev) => !prev); // 상태를 토글하여 트리 새로고침 트리거
  };

  return (
    <Container fluid className="h-100 container_bg">
      <Row className="container_title">
        <Col>
          <h2>{comAPIContext.$msg('menu', 'manage_code', '코드 관리')}</h2>
        </Col>
      </Row>
      <Row className="container_contents divide">
        {/* 좌측 메뉴 */}
        <Col className="menutree_wrap h-100">
          <ManageCodeTree
            onCodeClick={setChooseCodeData}
            refreshTree={refreshTree}
          />
        </Col>

        {/* 우측 콘텐츠 */}
        <Col className="h-100 contents_wrap">
          <ManageCodeContent
            chooseCodeData={chooseCodeData}
            onSave={handleRefreshTree}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ManageCode;
