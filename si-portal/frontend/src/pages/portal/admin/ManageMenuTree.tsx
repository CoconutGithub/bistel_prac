import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~store/Store";
import { ComAPIContext } from "~components/ComAPIContext";
import { Container, Dropdown, Form, Button, Modal } from "react-bootstrap";
import { cachedAuthToken } from "~store/AuthSlice";

interface ManageMenuTreeProps {
    onMenuClick: ({}: any) => void;
    refreshTree: boolean;
}

interface MenuItem {
    parentMenuId: number;
    menuId: number;
    msgId: number;
    depth: number;
    path: string;
    position: number;
    status: string;
    parentMenuName: string;
    menuName: string;
    children?: MenuItem[];
    isAdd: boolean;
    isDelete: boolean;
}

const ManageMenuTree: React.FC<{ onMenuClick: any, refreshTree: boolean }> = ({ onMenuClick, refreshTree }) => {
    const langCode = useSelector((state: RootState) => state.auth.user.langCode);
    const comAPIContext = useContext(ComAPIContext);


    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false); // 모달 표시 여부
    const [showMenuWarning, setShowMenuWarning] = useState<boolean>(false);
    const [selectedMenuId, setSelectedMenuId] = useState<number>(-1);
    const [visibleMenuIds, setVisibleMenuIds] = useState<number[]>([]);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        node: MenuItem | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        node: null,
    });

    const [inputText, setInputText] = useState<string>(""); // 텍스트 입력 상태
    const [isAdding, setIsAdding] = useState<boolean>(false); // 텍스트 입력 상태 여부

    // 각 메뉴 항목의 화면 위치를 저장하기 위한 ref
    const nodePositions = useRef<Map<number, DOMRect>>(new Map());
    const inputRef = useRef<HTMLInputElement | null>(null); // Add a ref for the input element
    const contextMenuRef = useRef<HTMLDivElement | null>(null); // Add a ref for the context menu
    const isBlurred = useRef<boolean>(false);
    
    console.log('render---------------------------------')


    useEffect(() => {
        const fetchData = async () => {
            try {
                comAPIContext.showProgressBar();
                const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree",
                    {
                        headers: {Authorization: `Bearer ${cachedAuthToken}`},
                        params: { langCode: langCode } as any,
                    }
                );

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
    }, [refreshTree]);

    useEffect(() => {
        nodePositions.current = new Map(); // 기존 값 초기화
    
        menuData.forEach((node) => {
            setTimeout(() => {
                const element = document.getElementById(`menu-item-${node.menuId}`);
                if (element) {
                    const rect = element.getBoundingClientRect();
            nodePositions.current.set(node.menuId, rect);
                }
            }, 0);
        });
        
    }, [menuData]); // menuData가 변경될 때마다 실행
    

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
        const treeData = buildTree(data, 0);
        return [
            {
                parentMenuId: -1,
                menuId: -1,
                depth: 0,
                path: "/",
                position: 0,
                menuName: "Root",
                msgId: -1,
                status: 'ACTIVE',
                parentMenuName: "",
                children: treeData,
                isAdd: false,
                isDelete: false,
            },
        ];
    };

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

    const handleMenuClick = useCallback((event: React.MouseEvent, node: MenuItem) => {
        const adjustedX = Math.max(event.clientX);
        const adjustedY = Math.max(event.clientY);

        console.log(node)

        setContextMenu({
            visible: true,
            x: adjustedX,
            y: adjustedY,
            node: node,
        });

        if (selectedMenuId !== node.menuId) {
            setSelectedMenuId(node.menuId);
            onMenuClick({ ...node, isAdd: false, isDelete: false });
        }
    }, [selectedMenuId, onMenuClick]);

    const handleContextMenu = (event: React.MouseEvent, node: MenuItem) => {
        event.preventDefault();
        event.stopPropagation();

        if(node.depth >= 3) {
            setShowMenuWarning(true)
            return
        }

        handleMenuClick(event, node)
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(event.target.value);
    };

    const handleDeleteConfirm = () => {
        setShowModal(true)
    }

    // 삭제 불가 메뉴인지 확인하는 함수
    const isDeletable = (menuId: number): boolean => {
        return menuId !== -1; // 예시로 menuId가 -1인 Root 메뉴는 삭제할 수 없다고 가정
    };

    const handleDeleteMenu = async () => { // 자식 노드까지 다 삭제 alert Y, N
        if (contextMenu.node) {
            try {

                const data = {
                    menuId: contextMenu.node.menuId
                };

                const res = await axios.post("http://localhost:8080/admin/api/delete-menu", data, {
                    headers: {
                        Authorization: `Bearer ${cachedAuthToken}`,
                    },
                });

                if (res.status === 200) {
                    console.log(res)
                    console.log("Menu deleted successfully");
                    setContextMenu({ ...contextMenu, visible: false })
                    try {
                        comAPIContext.showProgressBar();
                        const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree",
                            {
                                headers: {Authorization: `Bearer ${cachedAuthToken}`},
                                params: { langCode: langCode } as any,
                            },
                        );
        
                        if (res && res.data) {
                            setMenuData(res.data);
                            setShowModal(false)
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

    // 삭제 모달에서 확인 버튼 클릭 시
    const handleConfirmDelete = async () => {
        handleDeleteMenu()
    };

    const handleBlur = async () => {
        if (isBlurred.current) return; // 중복 실행 방지
        isBlurred.current = true;

        if(inputText.length === 0) {
            setIsAdding(false);
        } else {
            console.log('db insert')
            console.log(contextMenu.node)

                const childData = contextMenu.node

                console.log(childData)

                const data = {
                    menuName: inputText,
                    parentMenuId: childData?.menuId === -1 ? 0 : childData?.menuId,
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
                        Authorization: `Bearer ${cachedAuthToken}`,
                    },
                });

                console.log(res)
                comAPIContext.hideProgressBar();

                if(res.status === 200) {
                    setIsAdding(false);
                    setInputText('');
                    try {
                        comAPIContext.showProgressBar();
                        const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree",
                            {
                                headers: {Authorization: `Bearer ${cachedAuthToken}`},
                                params: { langCode: langCode } as any,
                            },
                        );
        
                        if (res && res.data) {
                            setMenuData(res.data);
                            console.log(res)
                        }
                    } catch (err) {
                        const error = err as Error;
                        console.error("Error fetching data:", err);
                        comAPIContext.showToast("Error fetching roles: " + error.message, "danger");
                    } finally {
                        isBlurred.current = false;
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
            event.preventDefault(); // 엔터 시 기본 동작 방지
            handleBlur();
        }
    }

    const renderTree = (nodes: MenuItem[], level: number = 0) => {
        return (
            <Container>
                <ul className="list-unstyled-item" style={{ marginBottom: 0, marginLeft: -40 }}>
                    {nodes.map((node) => (
                        <li
                            key={node.menuId}
                            className="list-group-item"  // mb-3를 제거
                            style={{ marginBottom: 0 }}  // 인라인 스타일로 margin-bottom: 0 설정
                            // onContextMenu={(event) => handleContextMenu(event, node)}
                        >
                            <div
                                ref={(el) => {
                                    if (el) {
                                        setTimeout(() => {
                                            const rect = el.getBoundingClientRect();
                                            nodePositions.current.set(node.menuId, rect);
                                        }, 0);
                                    }
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    marginLeft: `${level * 25}px`,
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
                                    onContextMenu={(event) => handleContextMenu(event, node)}
                                    onClick={(event) => handleMenuClick(event, node)}
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

    return (
        <div>
            {renderTree(treeData)}
            {contextMenu.visible && contextMenu.node && (
                <Dropdown.Menu show
                    ref={contextMenuRef}
                    style={{
                        position: "absolute",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        // background: "white",
                        // border: "1px solid gray",
                        // boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                        zIndex: 1000,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Dropdown.Header>
                        {menuData.find((item) => item.menuId === contextMenu?.node?.menuId)?.menuName || 'Root'}
                    </Dropdown.Header>
                    <Dropdown.Item
                        // style={{ padding: "5px 10px", cursor: "pointer" }}
                        // onClick={() => {
                        //     setIsAdding(true);
                        //     setContextMenu({ ...contextMenu, visible: false });
                        // }}
                    >
                    <Button className="me-2"  size="sm" variant="primary" onClick={() => {
                        setIsAdding(true);
                        setContextMenu({ ...contextMenu, visible: false });
                    }}>
                        { comAPIContext.$msg("label", "add", "추가") }
                    </Button>
                    <Button size="sm" variant="danger" onClick={handleDeleteConfirm}>
                        { comAPIContext.$msg("label", "delete", "삭제") }
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
            {/* 모달 창 */}
            <Modal show={showMenuWarning} onHide={() => setShowMenuWarning(false)}>
                <Modal.Header closeButton>
                <Modal.Title>삭제 확인</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                {("자식은 depth는 최대 3개 입니다.")}
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowMenuWarning(false)}>
                    확인
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageMenuTree;
