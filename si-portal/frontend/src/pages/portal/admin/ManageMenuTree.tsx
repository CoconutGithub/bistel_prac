import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~store/Store';
import { ComAPIContext } from '~components/ComAPIContext';
import { Button, Dropdown, Modal } from 'react-bootstrap';
import { cachedAuthToken } from '~store/AuthSlice';
import SortableTree, {
  changeNodeAtPath,
  removeNodeAtPath,
  addNodeUnderParent,
} from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css';

interface ManageMenuTreeProps {
  onMenuClick: ({}: any) => void;
  refreshTree: boolean;
}

const ManageMenuTree: React.FC<ManageMenuTreeProps> = ({
  onMenuClick,
  refreshTree,
}) => {
  const langCode = useSelector((state: RootState) => state.auth.user.langCode);
  const comAPIContext = useContext(ComAPIContext);

  const [menuData, setMenuData] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [selectedMenuId, setSelectedMenuId] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isBlurred = useRef<boolean>(false);
  const [contextMenu, setContextMenu] = useState<any>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
    path: [],
  });
  const [showMenuWarning, setShowMenuWarning] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        comAPIContext.showProgressBar();
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-menu-tree`,
          {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
            params: { langCode: langCode },
          }
        );

        const buildTree = (data: any[], parentMenuId: number): any[] => {
          return data
            .filter((item) => item.parentMenuId === parentMenuId)
            .map((item) => ({
              ...item,
              title: item.menuName,
              expanded: true,
              children: buildTree(data, item.menuId),
            }));
        };

        if (res && res.data) {
          const tree = buildTree(res.data, 0);
          setTreeData(tree);
          setMenuData(res.data)
        }
      } catch (err: any) {
        comAPIContext.showToast(
          'Error fetching menu: ' + err.message,
          'danger'
        );
      } finally {
        comAPIContext.hideProgressBar();
      }
    };

    fetchData();
  }, [refreshTree]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  useEffect(() => {
     if (isAdding) {
    // requestAnimationFrame을 사용하여 DOM 업데이트 후 실행
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
  }
  }, [isAdding]);

    const handleMenuClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      const adjustedX = Math.max(event.clientX);
      const adjustedY = Math.max(event.clientY);

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
    },
    [selectedMenuId, onMenuClick]
  );

  const flattenTree = (nodes: any[], parentId = 0, depth = 0): any[] => {
    return nodes.flatMap((node, index) => {
      const base = {
        menuId: node.menuId,
        parentMenuId: parentId,
        position: index,
        depth,
      };
      const children = node.children
        ? flattenTree(node.children, node.menuId, depth + 1)
        : [];
      return [base, ...children];
    });
  };

  const handleSaveToServer = async () => {
    const flattened = flattenTree(treeData);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/update-menu-tree`,
        { updateList: flattened },
        {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        }
      );

      if (res.data?.messageCode === 'success') {
        comAPIContext.showToast('메뉴 구조가 저장되었습니다.', 'success');
      } else {
        comAPIContext.showToast('저장 완료 응답이 없습니다.', 'warning');
      }
    } catch (err: any) {
      comAPIContext.showToast('저장 중 오류가 발생했습니다.', 'danger');
    }
  };

  // 삭제 모달에서 확인 버튼 클릭 시
  const handleConfirmDelete = async () => {
    if (contextMenu.node) {
      try {
        const data = {
          menuId: contextMenu.node.menuId,
        };

        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/delete-menu`,
          data,
          {
            headers: {
              Authorization: `Bearer ${cachedAuthToken}`,
            },
          }
        );

        if (res.status === 200) {
          setContextMenu({ ...contextMenu, visible: false });
          try {
            comAPIContext.showProgressBar();
            const res = await axios.get(
              `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-menu-tree`,
              {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
                params: { langCode: langCode } as any,
              }
            );

          const buildTree = (data: any[], parentMenuId: number): any[] => {
            return data
              .filter((item) => item.parentMenuId === parentMenuId)
              .map((item) => ({
                ...item,
                title: item.menuName,
                expanded: true,
                children: buildTree(data, item.menuId),
              }));
          };

          
          if (res && res.data) {
              const tree = buildTree(res.data, 0);
              setTreeData(tree);
              setMenuData(res.data)
              setShowModal(false);
            }
          } catch (err) {
            const error = err as Error;
            console.error("Error fetching data:", err);
            comAPIContext.showToast(
              "Error fetching roles: " + error.message,
              "danger"
            );
          } finally {
            comAPIContext.hideProgressBar();
          }
        }
      } catch (err) {
        console.error("Error deleting menu:", err);
      }
    }
  };

  const handleDeleteConfirm = () => {
    setShowModal(true);
  };

  // 삭제 불가 메뉴인지 확인하는 함수
  const isDeletable = (menuId: number): boolean => {
    return menuId !== -1; // 예시로 menuId가 -1인 Root 메뉴는 삭제할 수 없다고 가정
  };

  const handleBlur = async () => {
    if (isBlurred.current) return; // 중복 실행 방지
    isBlurred.current = true;

    if (inputText.length === 0) {
      setIsAdding(false);
    } else {
      const childData = contextMenu.node;

      const data = {
        menuName: inputText,
        parentMenuId: childData?.menuId === -1 ? 0 : childData?.menuId,
        depth: (childData?.depth ?? 0) + 1,
        path: childData?.path,
        position: 1,
        childYn: "N",
        status: "INACTIVE",
      };

      try {
        comAPIContext.showProgressBar();
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/insert-menu`,
          data,
          {
            headers: {
              Authorization: `Bearer ${cachedAuthToken}`,
            },
          }
        );

        comAPIContext.hideProgressBar();

        if (res.status === 200) {
          setIsAdding(false);
          setInputText("");
          try {
            comAPIContext.showProgressBar();
            const res = await axios.get(
              `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-menu-tree`,
              {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
                params: { langCode: langCode } as any,
              }
            );

          const buildTree = (data: any[], parentMenuId: number): any[] => {
            return data
              .filter((item) => item.parentMenuId === parentMenuId)
              .map((item) => ({
                ...item,
                title: item.menuName,
                expanded: true,
                children: buildTree(data, item.menuId),
              }));
          };

          
          if (res && res.data) {
              const tree = buildTree(res.data, 0);
              setTreeData(tree);
              setMenuData(res.data)
            }
          } catch (err) {
            const error = err as Error;
            console.error("Error fetching data:", err);
            comAPIContext.showToast(
              "Error fetching roles: " + error.message,
              "danger"
            );
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

  const delayedSetTreeData = useCallback((data: any[]) => {
    // 리렌더링 딜레이를 줘서 DnD 타겟이 먼저 등록되게 함
    setTimeout(() => setTreeData(data), 0);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setInputText(e.target.value);
};

  return (
    <div className="h-100" style={{ position: 'relative' }}>
      <DndProvider backend={HTML5Backend} {...({} as any)}>
      <SortableTree
        treeData={treeData}
        // onChange={(data) => setTreeData(data)}
        onChange={delayedSetTreeData}
        getNodeKey={({ node }) => node.menuId}
        generateNodeProps={({ node, path }) => ({
          title: (
            <div style={{ position: 'relative' }}>
              <span
                onClick={(event) => {
                  setSelectedNode(node);
                  // onMenuClick({ ...node, isAdd: false, isDelete: false });
                  handleMenuClick(event, node);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (node.depth >= 3) {
                    setShowMenuWarning(true);
                    return;
                  }
                  handleMenuClick(e, node);
                }}
                style={{
                  color: selectedNode?.menuId === node.menuId ? 'blue' : 'black',
                }}
                className="ellipsis"
              >
                {node.title}
              </span>

              {/* 메뉴 추가 인풋 렌더링 */}
              {isAdding && contextMenu.node && contextMenu.node?.menuId === node.menuId && (
                <div style={{ marginTop: '10px', marginLeft: '40px' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}// (e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBlur(); // 엔터 키로 blur 처리
                    }}
                    onBlur={handleBlur}
                    placeholder="메뉴 이름을 입력하세요"
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </div>
          ),
        })}
      />
      </DndProvider>
      <div className="menuSaveBtn">
        <Button variant="primary" size="sm" onClick={handleSaveToServer}>
          변경사항 저장
        </Button>
      </div>

      {contextMenu.visible && (
        <Dropdown.Menu
          show
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
        >
          <Dropdown.Header>
            {menuData.find((item) => item.menuId === contextMenu?.node?.menuId)
              ?.menuName || "Root"}
          </Dropdown.Header>
          <Dropdown.Item
          >
            <Button
              className="me-2"
              size="sm"
              variant="primary"
              onClick={() => {
                setIsAdding(true);
                setContextMenu({ ...contextMenu, visible: false });
              }}
            >
              {comAPIContext.$msg("label", "add", "추가")}
            </Button>
            <Button size="sm" variant="danger" onClick={handleDeleteConfirm}>
              {comAPIContext.$msg("label", "delete", "삭제")}
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
          {isDeletable(selectedMenuId)
            ? "하위 메뉴까지 모두 삭제됩니다. 정말로 삭제하시겠습니까?"
            : "Root 메뉴는 삭제할 수 없습니다."}
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
          <Modal.Title>깊이 제한</Modal.Title>
        </Modal.Header>
        <Modal.Body>자식 메뉴는 최대 3단계까지만 가능합니다.</Modal.Body>
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
