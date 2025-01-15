
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { ComAPIContext } from "~components/ComAPIContext";


interface Role {
    roleId: string;
    roleName: string;
}


const ManageMenu: React.FC = () => {

    console.log("ManageMenu 생성");
    const comAPIContext = useContext(ComAPIContext);
    const [comboData, setComboData] = useState<Role[] | null>(null); // 콤보박스 데이터 상태


    // 1. 초기 마운트 시 콤보박스 데이터를 가져오는 useEffect
    useEffect(() => {
        const fetchComboData = async () => {
            // DB에서 데이터를 가져오는 API 호출 (여기서는 Mock Data로 처리)
            const data = await new Promise<Role[]>((resolve) =>
                setTimeout(() => resolve([{ 'roleId': '1', 'roleName': 'Option 1' }, { 'roleId': '2', 'roleName': 'Option 2' }]), 1000)
            );
            setComboData(data);
        };

        fetchComboData();
    }, []); // 빈 배열로 설정 -> 컴포넌트 마운트 시 한 번만 실행


    return (
        <Container fluid>
        </Container>
    )
};

export default ManageMenu;
