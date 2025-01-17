import React from "react";
import { Container, Row } from "react-bootstrap";

type MenuItem = {
    id: string;
    name: string;
    content: string;
};

type ManageMenuTreeProps = {
    menuData: MenuItem[];
    onSelectMenu: (menu: MenuItem) => void;
};

const ManageMenuTree: React.FC<ManageMenuTreeProps> = ({ menuData, onSelectMenu }) => {
    return (
        <Container fluid className="h-100">
            <Row className="h-100 align-items-start">
                <ul className="list-unstyled w-100">
                    {menuData.map((menu) => (
                        <li key={menu.id} onClick={() => onSelectMenu(menu)}>
                            {menu.name}
                        </li>
                    ))}
                </ul>
            </Row>
        </Container>
    );
};

export default ManageMenuTree;
