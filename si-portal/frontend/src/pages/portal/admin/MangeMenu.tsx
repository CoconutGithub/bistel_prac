import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import ManageMenuTree from "~pages/portal/admin/ManageMenuTree";
import ManageMenuContent from "~pages/portal/admin/ManageMenuContent";
import { ChooseMenuData } from "~types/ChooseMenuData";


const ManageMenu: React.FC = () => {
    const [chooseMenuData, setChooseMenuData] = useState<ChooseMenuData | null>(null);

    return (
        <Container fluid className="h-100">
            <Row className="mb-3">
                <Col>
                    <h2>메뉴 관리</h2>
                </Col>
            </Row>
            <div style={{borderTop: '1px solid black', margin: '5px 0'}}></div>
            <Row className="h-100">
                {/* 좌측 메뉴 */}
                <Col style={{flex: '0 0 25%'}} className="border-end h-100">
                    <ManageMenuTree onMenuClick={setChooseMenuData} />
                </Col>

                {/* 우측 콘텐츠 */}
                <Col style={{flex: '0 0 75%'}} className="h-100">
                    <ManageMenuContent chooseMenuData={chooseMenuData} />
                </Col>
            </Row>
        </Container>
    );
};

export default ManageMenu;
