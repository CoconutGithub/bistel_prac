import React, {useContext, useEffect, useState, useRef} from "react";
import axios from "axios";
import {useSelector} from "react-redux";
import {RootState} from "~store/Store";
import {ComAPIContext} from "~components/ComAPIContext";
import {Container, Dropdown, Form, Button, Modal} from "react-bootstrap";
import ComButton from "~pages/portal/buttons/ComButton";

interface ManageMenuTreeProps {
    onMenuClick: ({}: any) => void;
}

interface MenuItem {
    childYn: string;
    parentMenuId: number;
    menuId: number;
    depth: number;
    path: string;
    parentMenuName: string;
    menuName: string;
    children?: MenuItem[];
    isAdd: boolean;
    isDelete: boolean;
    path: string;
    position: number;
    status: string;
}

const ManageMenuTree: React.FC<ManageMenuTreeProps> = ({ onMenuClick }) => {
    const state = useSelector((state: RootState) => state.auth);
    const comAPIContext = useContext(ComAPIContext);

    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [selectedMenuId, setSelectedMenuId] = useState<number>(-1); // 선택된 메뉴 ID
    const [visibleMenuIds, setVisibleMenuIds] = useState<number[]>([]); // 열려 있는 메뉴 ID들
    const [showAddChildMenu, setShowAddChildMenu] = useState<boolean>(false);
    const [parentMenuId, setParentMenuId] = useState<number>(-1);
    const [menuPosition, setMenuPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });
    const [showModal, setShowModal] = useState<boolean>(false); // 모달 표시 여부
    const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {}); // 확인할 액션
    //########## State 정의-끝 #############
    const newChildLabelRef = useRef<string>("");
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleInputChange event :', event.target.value);
        newChildLabelRef.current = event.target.value;
      };
    
    // 메뉴 데이터를 가져오기 (useEffect에서 마운트 시 실행)
    useEffect(() => {
        // 실제로는 axios 등을 사용해 데이터를 가져옵니다.
        const fetchData = async () => {

    const [inputText, setInputText] = useState<string>(""); // 텍스트 입력 상태
    const [isAdding, setIsAdding] = useState<boolean>(false); // 텍스트 입력 상태 여부

    // 각 메뉴 항목의 화면 위치를 저장하기 위한 ref
    const nodePositions = useRef<Map<number, DOMRect>>(new Map());
    const inputRef = useRef<HTMLInputElement | null>(null); // Add a ref for the input element
    const contextMenuRef = useRef<HTMLDivElement | null>(null); // Add a ref for the context menu

    console.log('render---------------------------------')


    useEffect(() => {
        const fetchData = async () => {
            try {
                comAPIContext.showProgressBar();
                const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree", {
                    headers: {
                        Authorization: `Bearer ${state.authToken}`,
                    },
                });

                if (res && res.data) {
                    setMenuData(res.data);
                    console.log(res)
                }
            } catch (err) {
                const error = err as Error;
                console.error("Error fetching data:", err);
                comAPIContext.showToast("Error fetching roles: " + error.message, "danger");
            } finally {
                comAPIContext.hideProgressBar();
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
                setContextMenu({ visible: false, x: 0, y: 0, node: null });
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const buildTreeWithRoot = (data: MenuItem[]): MenuItem[] => {
        const treeData = buildTree(data, 0); // 기존 트리 데이터 빌드
        console.log('생성 treeData :', treeData)
        return [
            {
                parentMenuId: -1, // Root는 최상위 노드
                menuId: -1, // Root 노드의 고유 ID (-1로 설정)
                menuName: "Root", // Root 노드 이름
                parentMenuName: "", // Root 노드 이름
                children: treeData, // 기존 트리 데이터를 자식으로 포함
                isAdd: false, // 필요 시 설정
                isDelete: false, // 필요 시 설정
                childYn: "N",
                path: "",
                position: 0,
                status: "ACTIVE",
            },
        ];
    };

    // 컨텍스트 메뉴 처리
    const handleRightClick = (event: React.MouseEvent, node: MenuItem) => {
        event.preventDefault(); // 기본 오른쪽 클릭 메뉴 방지
        event.stopPropagation(); // 이벤트가 상위 요소로 전파되는 것을 방지

        // 마우스 위치 가져오기
        const { clientX, clientY } = event;

        setSelectedMenuId(node.menuId); // 선택된 메뉴 ID 설정
        onMenuClick({...node, 'isAdd': false, 'isDelete': false});
        setParentMenuId(node.menuId); // 부모 메뉴 ID 설정
        setMenuPosition({ top: clientY, left: clientX }); // 컨텍스트 메뉴 위치 설정
        setShowAddChildMenu(true); // 자식 추가 메뉴 보이기
        console.log('컨텍스트 메뉴처리')
        console.log('node-data :', node)
    };

    // 자식 노드 추가
    const handleAddChildNode = () => {
        console.log('자식 노드 추가')
        console.log('parentMenuId :', parentMenuId)
        console.log('newChildLabel :', newChildLabelRef.current)
        if (newChildLabelRef.current.trim()) {
            addChildNode(parentMenuId, newChildLabelRef.current);
            // setNewChildLabel(newChildLabelRef);
            setShowAddChildMenu(false); // 메뉴 숨기기
        } else {
            comAPIContext.showToast("자식 노드의 이름을 입력하세요.", "danger");
        }
    };

    const addChildNode = async (parentId: number, label: string) => {
        console.log('addChildNode')
        console.log('parentId :', parentId)
        console.log('label :', label)

        const updatedMenuData = [...menuData];
        console.log('추가전 updatedMenuDatau :', updatedMenuData)
        const res = await axios.get("http://localhost:8080/admin/api/get-menu-id", {
            headers: {
                Authorization: `Bearer ${state.authToken}`,
            },
        });

        if (res && res.data) {
            console.log('res.data :', res.data)
            const childNode = {childYn: "N",
                menuId: res.data,
                menuName: label,
                parentMenuId: parentId,            
                parentMenuName: updatedMenuData.find((item) => item.menuId === parentMenuId)?.menuName??'',
                path: '',
                position: 0,
                status: 'ACTIVE',
                isAdd: true,
                isDelete: false,}
            updatedMenuData.push(childNode);
 
            console.log('자식 추가후 updatedMenuData : ', updatedMenuData)
            setMenuData(updatedMenuData);
            setSelectedMenuId(res.data); // 선택된 메뉴 ID 설정
            onMenuClick({...childNode, 'isAdd': false, 'isDelete': false});
        }
        
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

    const handleMenuClick = useCallback((node: MenuItem) => {
        if (selectedMenuId !== node.menuId) {
            setSelectedMenuId(node.menuId);
            onMenuClick({ ...node, isAdd: false, isDelete: false });
        }
    }, [selectedMenuId, onMenuClick]);

    const findClosestMenu = (event: React.MouseEvent) => {
        const { clientX, clientY } = event;
        let closestNode: MenuItem | null = null;
        let closestDistance = Infinity;
    
        nodePositions.current.forEach((rect, menuId) => {
            const centerX = rect.left + rect.width * 2/3;
            const centerY = rect.top + rect.height * 0.5;
            const distance = Math.sqrt(
                Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
            );
    
            if (distance < closestDistance) {
                closestDistance = distance;
                closestNode = menuData.find((node) => node.menuId === menuId) || null;
            }
        });
    
        return closestNode;
    };

    const handleContextMenu = (event: React.MouseEvent, node: MenuItem) => {
        event.preventDefault();
        event.stopPropagation();

        const menuWidth = 150;
        const menuHeight = 100;
        const adjustedX = Math.max(event.clientX - menuWidth*2/3, 0);
        const adjustedY = Math.max(event.clientY - menuHeight*0.5, 0);

        const closestNode = findClosestMenu(event);
        console.log(closestNode)
        setContextMenu({
            visible: true,
            x: adjustedX,
            y: adjustedY,
            node: closestNode,
        });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handleDeleteMenu = async () => { // 자식 노드까지 다 삭제 alert Y, N
        console.log(contextMenu)
        if (contextMenu.node) {
            try {

                const data = {
                    menuId: contextMenu.node.menuId
                };

                const res = await axios.post("http://localhost:8080/admin/api/delete-menu", data, {
                    headers: {
                        Authorization: `Bearer ${state.authToken}`,
                    },
                });

                if (res.status === 200) {
                    console.log(res)
                    console.log("Menu deleted successfully");
                    setContextMenu({ ...contextMenu, visible: false })
                    try {
                        comAPIContext.showProgressBar();
                        const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree", {
                            headers: {
                                Authorization: `Bearer ${state.authToken}`,
                            },
                        });
        
                        if (res && res.data) {
                            setMenuData(res.data);
                        }
                    } catch (err) {
                        const error = err as Error;
                        console.error("Error fetching data:", err);
                        comAPIContext.showToast("Error fetching roles: " + error.message, "danger");
                    } finally {
                        comAPIContext.hideProgressBar();
                    }
                }
            } catch (err) {
                console.error("Error deleting menu:", err);
            }
        }
    };

    const handleBlur = async () => {
        if(inputText.length === 0) {
            setIsAdding(false);
        } else {
            console.log('db insert')
            console.log(contextMenu.node)

                const childData = contextMenu.node

                const data = {
                    menuName: inputText,
                    parentMenuId: childData?.menuId,
                    depth: (childData?.depth ?? 0) + 1,
                    path: childData?.path,
                    position: 1,
                    childYn: 'N',
                    status: 'INACTIVE'
                };
          

            try {
                comAPIContext.showProgressBar();
                const res = await axios.post('http://localhost:8080/admin/api/insert-menu', data, {
                    headers: {
                        Authorization: `Bearer ${state.authToken}`,
                    },
                });

                console.log(res)
                comAPIContext.hideProgressBar();

                if(res.status === 200) {
                    setIsAdding(false);
                    setInputText('');
                    try {
                        comAPIContext.showProgressBar();
                        const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree", {
                            headers: {
                                Authorization: `Bearer ${state.authToken}`,
                            },
                        });
        
                        if (res && res.data) {
                            setMenuData(res.data);
                            console.log(res)
                        }
                    } catch (err) {
                        const error = err as Error;
                        console.error("Error fetching data:", err);
                        comAPIContext.showToast("Error fetching roles: " + error.message, "danger");
                    } finally {
                        comAPIContext.hideProgressBar();
                    }
                }

            } catch (err) {
                console.error("Error deleting menu:", err);
            }

        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.code === 'Enter') {
            handleBlur();
        }
    }

    const renderTree = (nodes: MenuItem[], level: number = 0) => {
        return (
            <Container>
                <ul className="list-unstyled mb-3">
                    {nodes.map((node) => (
                        <li
                            key={node.menuId}
                            className="list-group-item mb-3"
                            onContextMenu={(e) => handleRightClick(e, node)}
                        >
                            <div
                                ref={(el) => {
                                    if (el) {
                                        const rect = el.getBoundingClientRect();
                                        nodePositions.current.set(node.menuId, rect);
                                    }
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    marginLeft: `${level * 15}px`,
                                    fontWeight: "bold",
                                    color:
                                        selectedMenuId !== null && node.menuId === selectedMenuId
                                            ? "blue"
                                            : "black",
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
                                    style={{ flex: 1 }}
                                >
                                    {node.menuName}
                                </span>
                            </div>
                            {visibleMenuIds.includes(node.menuId) &&
                                node.children?.length! > 0 &&
                                renderTree(node.children!, level + 1)}

                            {isAdding && contextMenu.node?.menuId === node.menuId && (
                                <div style={{ marginTop: "10px", marginLeft: "40px" }}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputText}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleBlur}
                                        placeholder="메뉴 이름을 입력하세요"
                                        style={{ width: "100%"}}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </Container>
        );
    };

    const treeData = buildTreeWithRoot(menuData);

    // 삭제 불가 메뉴인지 확인하는 함수
    const isDeletable = (menuId: number): boolean => {
        return menuId !== -1; // 예시로 menuId가 -1인 Root 메뉴는 삭제할 수 없다고 가정
    };

    const handleDeleteMenu = async () => {
        if (!isDeletable(selectedMenuId)) {
            // 삭제할 수 없는 경우 경고 모달 띄우기
            setConfirmAction(() => () => {});
            setShowModal(true);
            return;
        }
        setShowModal(true);
        setConfirmAction(() => async () => {
            // 실제 삭제 로직을 여기에 추가 (예: 서버 요청)
            console.log('menuData :', menuData);
            const descendantMenuIds = findMenuAndChildren(treeData, selectedMenuId)?.map((item) => item.menuId);
            console.log('descendantMenuIds :', descendantMenuIds)
            const payload = {
                deleteList: descendantMenuIds,
            };
            console.log('payload :', payload);
            const response = await axios.post('http://localhost:8080/admin/api/delete-menu', payload, {
                headers: { Authorization: `Bearer ${state.authToken}` },
            });
            console.log('response:', response);
            if (response.data.messageCode === 'success') {
                comAPIContext.showToast("삭제되었습니다.", "dark");
            } else {
                comAPIContext.showToast("삭제에 실패했습니다.", "danger");
            }
            // confirmAction();
            console.log('삭제 전 menuData :', menuData);
            const updatedMenuData = menuData.filter((item) => !descendantMenuIds?.includes(item.menuId));
            console.log('삭제 후 menuData : ', updatedMenuData)   ;     
            setMenuData(updatedMenuData);
            setShowModal(false); // 모달 닫기            
          });
          
    }
     
    // 삭제 모달에서 확인 버튼 클릭 시
    const handleConfirmDelete =async () => {
        confirmAction();    
        setShowModal(false); // 모달 닫기
        setShowAddChildMenu(false); // 컨텍스트 창 숨기기
        console.log('menuData :', menuData);
        console.log('handleConfirmDelete :',menuData.find((e: MenuItem) => e.menuId === 1))
        onMenuClick({...{menuName: 'Root'}, 'isAdd': false, 'isDelete': false});
    };

    // 주어진 트리 구조에서 특정 menuId와 그 하위 항목들을 찾는 함수
    function findMenuAndChildren(menuItems: MenuItem[], targetMenuId: number): MenuItem[] | null {
        // 트리 구조를 순회하며 menuId를 찾음
        for (let item of menuItems) {
            // 현재 메뉴가 찾고자 하는 menuId와 일치하는지 확인
            if (item.menuId === targetMenuId) {
                // 해당 메뉴와 하위 메뉴들을 반환 (자식 메뉴가 있을 경우 재귀적으로 처리)
                return getAllChildren(item);
            }

            // 자식 항목이 존재하면 재귀적으로 확인
            if (item.children && item.children.length > 0) {
                const result = findMenuAndChildren(item.children, targetMenuId);
                if (result) return result;  // 자식 트리에서 찾은 경우
            }
        }

        // 메뉴를 찾지 못한 경우
        return null;
    }

    // 해당 메뉴와 그 하위 항목들을 모두 반환하는 함수
    function getAllChildren(menu: MenuItem): MenuItem[] {
        let result: MenuItem[] = [menu];  // 자신을 먼저 포함

        // 자식 메뉴가 있을 경우 재귀적으로 모두 포함
        if (menu.children && menu.children.length > 0) {
            for (let child of menu.children) {
                result = result.concat(getAllChildren(child));
            }
        }

        return result;
    }
    //################### 메소드 영역-end ####################


    return (
        <div>
            {/* <div className="mt-3">
                <ComButton size="sm" className="me-2" variant="primary" onClick={handleAddMenu}>추가</ComButton>
                <ComButton size="sm" variant="danger" onClick={handleDeleteMenu}>삭제</ComButton>
            </div> */}
            <div className="mt-3"></div>
            {renderTree(treeData)}
        
        {/* 컨텍스트 메뉴 팝업 */}
        {showAddChildMenu && (
            <Dropdown.Menu show
                style={{
                    position: "absolute", // 절대 위치로 설정
                    top: `${menuPosition.top}px`, // 마우스 Y 좌표
                    left: `${menuPosition.left}px`, // 마우스 X 좌표
                    zIndex: 1050, // 컨텍스트 메뉴가 다른 요소 위에 오도록 설정
                }}
            >
                <Dropdown.Header>
                    {menuData.find((item) => item.menuId === parentMenuId)?.menuName}
                </Dropdown.Header>
                <Dropdown.Item>
                    <Button size="sm" variant="primary" onClick={handleDeleteMenu}>
                        삭제
                    </Button>
                </Dropdown.Item>
                <Dropdown.Item>
                    <Form.Control
                        type="text"
                        // value={newChildLabel}
                        onChange={handleInputChange}
                        placeholder="자식 노드 이름"
                    />
                </Dropdown.Item>
                <Dropdown.Item>
                    <Button size="sm" variant="primary" onClick={handleAddChildNode}>
                        추가
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setShowAddChildMenu(false)}>
                        취소
                    </Button>
                </Dropdown.Item>
            </Dropdown.Menu>
        )}
        {/* 모달 창 */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
            <Modal.Title>삭제 확인</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {isDeletable(selectedMenuId) ? (
                "하위 메뉴까지 모두 삭제됩니다. 정말로 삭제하시겠습니까?"
            ) : (
                "Root 메뉴는 삭제할 수 없습니다."
            )}
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
                취소
            </Button>
            {isDeletable(selectedMenuId) ? (
                <Button variant="danger" onClick={handleConfirmDelete}>
                삭제
                </Button>
            ) : (
                <Button variant="danger" disabled>
                삭제
                </Button>
            )}
            </Modal.Footer>
        </Modal>
        </div>
    );
};

export default ManageMenuTree;
