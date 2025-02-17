import React, { useState, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ChooseCodeData } from "@/types/ChooseCodeData";
import ManageCodeTree from '~pages/portal/admin/ManageCodeTree';
import ManageCodeContent from '~pages/portal/admin/ManageCodeContent';
import { ComAPIContext } from "~components/ComAPIContext";

const ManageCode: React.FC = () => {
  const comAPIContext = useContext(ComAPIContext);
  const [chooseCodeData, setChooseCodeData] = useState<ChooseCodeData | null>(null);
  const [refreshTree, setRefreshTree] = useState(false);

  const handleRefreshTree = () => {
      setRefreshTree(prev => !prev); // 상태를 토글하여 트리 새로고침 트리거
  };

  return (
      <Container fluid className="h-100">
          <Row className="mb-3">
              <Col>
                  <h2>{comAPIContext.$msg("menu", "manage_code", "코드 관리")}</h2>
              </Col>
          </Row>
          <div style={{borderTop: '1px solid black', margin: '5px 0'}}></div>
          <Row className="h-100">
              {/* 좌측 메뉴 */}
              <Col style={{flex: '0 0 30%'}} className="border-end h-100">
                  <ManageCodeTree onCodeClick={setChooseCodeData} refreshTree={refreshTree} />
              </Col>

              {/* 우측 콘텐츠 */}
              <Col style={{flex: '0 0 70%'}} className="h-100">
                  <ManageCodeContent chooseCodeData={chooseCodeData} onSave={handleRefreshTree}/>
              </Col>
          </Row>
      </Container>
  );
};

export default ManageCode;