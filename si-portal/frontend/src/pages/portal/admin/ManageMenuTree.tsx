import React, {useContext, useEffect, useState} from "react";
import axios from "axios";
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";
import {ComAPIContext} from "~components/ComAPIContext";
import {Container} from "react-bootstrap";
import ComButton from "~pages/portal/buttons/ComButton";

// 컴포넌트 Props 타입 정의
interface ManageMenuTreeProps {
    onMenuClick: ({}: any) => void;
}

interface MenuItem {
    parentMenuId: number;
    menuId: number;
    parentMenuName: string;
    menuName: string;
    children?: MenuItem[];
    isAdd: boolean;
    isDelete: boolean;
}

const ManageMenuTree: React.FC<ManageMenuTreeProps> = ({ onMenuClick }) => {

    console.log("ManageMenuTree 생성됨.");

    //==start: 여기는 무조건 공통으로 받는다고 생각하자
    const state = useSelector((state: RootState) => state.auth);
    const comAPIContext = useContext(ComAPIContext);
    //==end: 여기는 무조건 공통으로 받는다고 생각하자

    //########## State 정의-시작 #############
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [selectedMenuId, setSelectedMenuId] = useState<number>(-1); // 선택된 메뉴 ID
    const [visibleMenuIds, setVisibleMenuIds] = useState<number[]>([]); // 열려 있는 메뉴 ID들
    //########## State 정의-끝 #############
    
    // 메뉴 데이터를 가져오기 (useEffect에서 마운트 시 실행)
    useEffect(() => {
        // 실제로는 axios 등을 사용해 데이터를 가져옵니다.
        const fetchData = async () => {

            try {
                comAPIContext.showProgressBar();
                const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree", {
                    headers: {
                        Authorization: `Bearer ${state.authToken}`,
                    },
                });

                if (res && res.data) {
                    console.log(res.data)
                    setMenuData(res.data);
                }

            } catch (err) {
                const error = err as Error; // 타입 단언
                console.error("Error fetching data:", err);
                comAPIContext.showToast("Error fetching roles: " + error.message, "danger");
            } finally {
                comAPIContext.hideProgressBar();
            }




        };

        fetchData();
    }, []);

    //################### 메소드 영역-start ####################
    const buildTreeWithRoot = (data: MenuItem[]): MenuItem[] => {
        const treeData = buildTree(data, 0); // 기존 트리 데이터 빌드
        return [
            {
                parentMenuId: -1, // Root는 최상위 노드
                menuId: -1, // Root 노드의 고유 ID (-1로 설정)
                menuName: "Root", // Root 노드 이름
                parentMenuName: "", // Root 노드 이름
                children: treeData, // 기존 트리 데이터를 자식으로 포함
                isAdd: false, // 필요 시 설정
                isDelete: false, // 필요 시 설정
            },
        ];
    };

    // 트리 구조를 만들기
    const buildTree = (data: MenuItem[], parentMenuId: number | null): MenuItem[] => {
        return data
            .filter((item) => item.parentMenuId === parentMenuId)
            .map((item) => ({
                ...item,
                children: buildTree(data, item.menuId),
            }));
    };

    const toggleMenuVisibility = (menuId: number) => {
        if (visibleMenuIds.includes(menuId)) {
            setVisibleMenuIds(visibleMenuIds.filter((id) => id !== menuId));
        } else {
            setVisibleMenuIds([...visibleMenuIds, menuId]);
        }
    };

    const handleMenuClick = (node: MenuItem) => {

        console.log('node-data :', node)

        setSelectedMenuId(node.menuId); // 선택된 메뉴 ID 설정
        onMenuClick({...node, 'isAdd': false, 'isDelete': false});
    };

    const renderTree = (nodes :  MenuItem[], level : number = 0) => {
        return (
            <Container>
                <ul className="list-unstyled mb-3">
                    {nodes.map((node) => (
                        <li
                            key={node.menuId}
                            className="list-group-item mb-3"
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    marginLeft: `${level * 15}px`,
                                    fontWeight: "bold",
                                    color:
                                        selectedMenuId !== null && node.menuId === selectedMenuId
                                            ? "blue"
                                            : "black", // 선택된 메뉴는 파란색
                                }}
                            >
                                {node.children?.length! > 0 && (
                                    <span
                                        onClick={() => toggleMenuVisibility(node.menuId)}
                                        style={{
                                            marginRight: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {visibleMenuIds.includes(node.menuId) ? "▼" : "▶"}
                                    </span>
                                )}
                                    <span
                                        onClick={() => handleMenuClick(node)}
                                        style={{flex: 1}}
                                    >
                                        {node.menuName}
                                    </span>
                            </div>
                            {visibleMenuIds.includes(node.menuId) &&
                                node.children?.length! > 0 &&
                                renderTree(node.children!, level + 1)}
                        </li>
                    ))}
                </ul>
            </Container>
        );
    };

    // const treeData = buildTree(menuData, 0);
    const treeData = buildTreeWithRoot(menuData);

    const handleAddMenu = () => {
        console.log("============>", selectedMenuId);
        /*
            xxx-cho
            1. ManageMenu 로 선택한 값을 넘기고
            2. 그걸 ㅂ
         */
    }

    const handleDeleteMenu = () => {
        if (selectedMenuId === -1) {
            comAPIContext.showToast("Root는 삭제할수 없습니다.", "danger");
        } else {
            //xxx-cho
            //confrim modal 로 하위도 싹 삭제될수 있다고 경고 띄우고 지워야함.
        }
    }
    //################### 메소드 영역-end ####################


    return (
        <div>
            <div className="mt-3">
                <ComButton size="sm" className="me-2" variant="primary" onClick={handleAddMenu}>추가</ComButton>
                <ComButton size="sm" variant="danger" onClick={handleDeleteMenu}>삭제</ComButton>
            </div>
            <div className="mt-3"></div>
            {renderTree(treeData)}
        </div>
    );
};

export default ManageMenuTree;
