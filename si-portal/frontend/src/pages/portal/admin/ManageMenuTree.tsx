import React, { useContext, useEffect, useState, useRef } from 'react';
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

  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
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

  const handleAddNode = (path: number[]) => {
    if (contextMenu.node.depth >= 3) {
      setShowMenuWarning(true);
      return;
    }

    const newNode = {
      title: '새 메뉴',
      menuId: Date.now(),
      parentMenuId: contextMenu.node.menuId,
      children: [],
      depth: contextMenu.node.depth + 1,
    };

    const result = addNodeUnderParent({
      treeData,
      parentKey: path[path.length - 1],
      expandParent: true,
      getNodeKey: ({ treeIndex }) => treeIndex,
      newNode,
    });

    if (result.treeData) {
      setTreeData(result.treeData);
    }
  };

  const handleDeleteNode = () => {
    if (contextMenu.node.menuId === -1) {
      setShowModal(true);
      return;
    }

    const newTree = removeNodeAtPath({
      treeData,
      path: contextMenu.path,
      getNodeKey: ({ treeIndex }) => treeIndex,
    });

    setTreeData(newTree);
    setContextMenu({ ...contextMenu, visible: false });
  };

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

  return (
    <div className="h-100" style={{ position: 'relative' }}>
      <SortableTree
        treeData={treeData}
        onChange={(data) => setTreeData(data)}
        getNodeKey={({ node }) => node.menuId}
        generateNodeProps={({ node, path }) => ({
          title: (
            <span
              onClick={() => {
                setSelectedNode(node);
                onMenuClick({ ...node, isAdd: false, isDelete: false });
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  node,
                  path,
                });
              }}
              style={{
                color: selectedNode?.menuId === node.menuId ? 'blue' : 'black',
              }}
              className="ellipsis"
            >
              {node.title}
            </span>
          ),
        })}
      />
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
            position: 'absolute',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
        >
          <Dropdown.Header>{contextMenu.node.title}</Dropdown.Header>
          <Dropdown.Item onClick={() => handleAddNode(contextMenu.path)}>
            추가
          </Dropdown.Item>
          <Dropdown.Item onClick={handleDeleteNode}>삭제</Dropdown.Item>
        </Dropdown.Menu>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>삭제 불가</Modal.Title>
        </Modal.Header>
        <Modal.Body>Root 메뉴는 삭제할 수 없습니다.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            확인
          </Button>
        </Modal.Footer>
      </Modal>

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
