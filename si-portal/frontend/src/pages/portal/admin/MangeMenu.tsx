import React, { useState, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import ManageMenuTree from "~pages/portal/admin/ManageMenuTree";
import MangeMenuContent from "~pages/portal/admin/ManageMenuContent";

type MenuItem = {
    id: string;
    name: string;
    content: string;
};

const ManageMenu: React.FC = () => {
    // 메뉴 데이터 상태
    const [menuData, setMenuData] = useState<MenuItem[]>([]);

    // 선택된 메뉴 상태
    const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

    useEffect(() => {
        // 메뉴 트리 데이터
        const dbMenuData: MenuItem[] = [
            { id: '1', name: "Dashboard", content: "This is the Dashboard content" },
            { id: '2', name: "Settings", content: "This is the Settings content" },
            { id: '3', name: "Profile", content: "This is the Profile content" },
        ];

        setMenuData(dbMenuData);
    }, []);

    return (
        <Container fluid className="h-100">
            <Row className="mb-3">
                <Col>
                    <h2>메뉴 관리</h2>
                </Col>
            </Row>
            <div style={{borderTop: '1px solid black', margin: '15px 0'}}></div>
            <Row className="mb-3 h-100">
                {/* 좌측 메뉴 */}
                <Col style={{flex: '0 0 30%'}} className="bg-light border-end h-100">
                    <ManageMenuTree menuData={menuData} onSelectMenu={setSelectedMenu}/>
                </Col>

                {/* 우측 콘텐츠 */}
                <Col style={{flex: '0 0 70%'}} className="p-3 h-100">
                    <MangeMenuContent selectedMenu={selectedMenu}/>
                </Col>
            </Row>
        </Container>
    );
};

export default ManageMenu;
