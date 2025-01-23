import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~store/Store";
import { ComAPIContext } from "~components/ComAPIContext";
import { Container } from "react-bootstrap";
import { cachedAuthToken } from "~store/AuthSlice";

interface ManageMenuTreeProps {
    onMenuClick: ({}: any) => void;
}

interface MenuItem {
    parentMenuId: number;
    menuId: number;
    depth: number;
    path: string;
    parentMenuName: string;
    menuName: string;
    children?: MenuItem[];
    isAdd: boolean;
    isDelete: boolean;
}

const ManageMenuTree: React.FC<ManageMenuTreeProps> = ({ onMenuClick }) => {
    const state = useSelector((state: RootState) => state.auth);
    const comAPIContext = useContext(ComAPIContext);

    const [menuData, setMenuData] = useState<MenuItem[]>([]);
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

    console.log('render---------------------------------')


    useEffect(() => {
        const fetchData = async () => {
            try {
                comAPIContext.showProgressBar();
                const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree", {
                    headers: {
                        Authorization: `Bearer ${cachedAuthToken}`,
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
        const treeData = buildTree(data, 0);
        return [
            {
                parentMenuId: -1,
                menuId: -1,
                depth: -1,
                path: "",
                menuName: "Root",
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
                        Authorization: `Bearer ${cachedAuthToken}`,
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
                                Authorization: `Bearer ${cachedAuthToken}`,
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
                        const res = await axios.get("http://localhost:8080/admin/api/get-menu-tree", {
                            headers: {
                                Authorization: `Bearer ${cachedAuthToken}`,
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
                            onContextMenu={(event) => handleContextMenu(event, node)}
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

    return (
        <div>
            {renderTree(treeData)}
            {contextMenu.visible && contextMenu.node && (
                <div
                    ref={contextMenuRef}
                    style={{
                        position: "absolute",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        background: "white",
                        border: "1px solid gray",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                        zIndex: 1000,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        style={{ padding: "5px 10px", cursor: "pointer" }}
                        onClick={() => {
                            setIsAdding(true);
                            setContextMenu({ ...contextMenu, visible: false });
                        }}
                    >
                        추가
                    </div>
                    <div
                        style={{ padding: "5px 10px", cursor: "pointer" }}
                        onClick={handleDeleteMenu}
                    >
                        삭제
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenuTree;
