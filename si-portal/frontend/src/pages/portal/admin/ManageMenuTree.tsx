import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~store/Store";
import { ComAPIContext } from "~components/ComAPIContext";
import { Button } from "react-bootstrap";
import { cachedAuthToken } from "~store/AuthSlice";
import SortableTree from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css';

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

const ManageMenuTree: React.FC<ManageMenuTreeProps> = ({ onMenuClick, refreshTree }) => {
  const langCode = useSelector((state: RootState) => state.auth.user.langCode);
  const comAPIContext = useContext(ComAPIContext);

  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        comAPIContext.showProgressBar();
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_IP}/admin/api/get-menu-tree`, {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
          params: { langCode: langCode },
        });

        if (res && res.data) {
          setMenuData(res.data);
        }
      } catch (err) {
        const error = err as Error;
        comAPIContext.showToast("Error fetching menu: " + error.message, "danger");
      } finally {
        comAPIContext.hideProgressBar();
      }
    };

    fetchData();
  }, [refreshTree]);

  useEffect(() => {
    const convertToTreeData = (data: MenuItem[]): any[] => {
      return data.map((item) => ({
        title: item.menuName,
        menuId: item.menuId,
        parentMenuId: item.parentMenuId,
        expanded: true,
        children: item.children ? convertToTreeData(item.children) : [],
      }));
    };

    const buildTree = (data: MenuItem[], parentMenuId: number): MenuItem[] => {
      return data
          .filter((item) => item.parentMenuId === parentMenuId)
          .map((item) => ({ ...item, children: buildTree(data, item.menuId) }));
    };

    const rootTree = buildTree(menuData, 0);
    setTreeData(convertToTreeData(rootTree));
  }, [menuData]);

  const flattenTree = (nodes: any[], parentId = 0, depth = 0): any[] => {
    return nodes.flatMap((node, index) => {
      const base = {
        menuId: node.menuId,
        parentMenuId: parentId,
        position: index,
        depth: depth,
      };
      const children = node.children ? flattenTree(node.children, node.menuId, depth + 1) : [];
      return [base, ...children];
    });
  };

  const handleSaveToServer = async () => {
    const flattened = flattenTree(treeData);
    console.log("🖱️ 저장 클릭됨");
    console.log("토큰:", cachedAuthToken);
    console.log("보낼 데이터:", flattened);

    try {
      const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/update-menu-tree`,
          { updateList: flattened },
          {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
          }
      );

      if (res && res.data && res.data.messageCode === "success") {
        comAPIContext.showToast("메뉴 구조가 저장되었습니다.", "success");
      } else {
        comAPIContext.showToast("저장 완료 응답이 없습니다.", "warning");
      }
    } catch (err: any) {
      console.error("❌ 저장 중 에러:", err);
      comAPIContext.showToast("저장 중 오류가 발생했습니다.", "danger");
    } finally {
      comAPIContext.hideProgressBar();
    }
  };

  return (
      <div style={{ height: 600 }}>
        <SortableTree
            treeData={treeData}
            onChange={(data) => setTreeData(data)}
            getNodeKey={({ node }) => node.menuId}
            generateNodeProps={({ node }) => ({
              title: node.title,
            })}
        />
        <div className="text-end mt-3">
          <Button
              variant="primary"
              size="sm"
              onClick={handleSaveToServer}
          >
            변경사항 저장
          </Button>
        </div>
      </div>
  );
};

export default ManageMenuTree;
