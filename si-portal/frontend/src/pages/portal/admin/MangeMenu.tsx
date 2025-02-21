import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import ManageMenuTree from "~pages/portal/admin/ManageMenuTree";
import ManageMenuContent from "~pages/portal/admin/ManageMenuContent";
import { ChooseMenuData } from "~types/ChooseMenuData";


const ManageMenu: React.FC = () => {
    const [chooseMenuData, setChooseMenuData] = useState<ChooseMenuData | null>(null);
    const [refreshTree, setRefreshTree] = useState(false);

    const handleRefreshTree = () => {
        setRefreshTree(prev => !prev); // 상태를 토글하여 트리 새로고침 트리거
    };

    return (
        <Container fluid className="h-100 container_bg">
            <Row className="container_title">
                <Col>
                    <h2>메뉴 관리</h2>
                </Col>
            </Row>
            <Row className="container_contents divide">
                {/* 좌측 메뉴 */}
                <Col className="menutree_wrap h-100">
                    <ManageMenuTree onMenuClick={setChooseMenuData} refreshTree={refreshTree} />
                </Col>

                {/* 우측 콘텐츠 */}
                <Col className="h-100 contents_wrap">
                    <ManageMenuContent chooseMenuData={chooseMenuData} onSave={handleRefreshTree}/>
                </Col>
            </Row>
        </Container>
    );
};

export default ManageMenu;
