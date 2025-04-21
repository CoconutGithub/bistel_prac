import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~store/Store';
import { ComAPIContext } from '~components/ComAPIContext';
import { Container, Dropdown, Form, Button, Modal } from 'react-bootstrap';
import { cachedAuthToken } from '~store/AuthSlice';

interface ChooseCodeTreeProps {
  onCodeClick: (data: any) => void;
  refreshTree: boolean;
}

interface CodeItem {
  codeId: number;
  parentId: number;
  codeName: string;
  defaultText: string;
  msgId: number;
  level: number;
  codeOrder: number;
  status: string;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
  isAdd: boolean;
  isDelete: boolean;
  children?: CodeItem[];
  acode: string;
  bcode: string;
  ccode: string;
  dcode: string;
  ecode: string;
}

const ManageCodeTree: React.FC<ChooseCodeTreeProps> = ({
  onCodeClick,
  refreshTree,
}) => {
  const langCode = useSelector((state: RootState) => state.auth.user.langCode);
  const comAPIContext = useContext(ComAPIContext);
  const state = useSelector((state: RootState) => state.auth);

  const [codeData, setCodeData] = useState<CodeItem[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false); // 모달 표시 여부
  const [selectedCodeId, setSelectedCodeId] = useState<number>(-1);
  const [visibleCodeIds, setVisibleCodeIds] = useState<number[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: CodeItem | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  const [inputText, setInputText] = useState<string>(''); // 텍스트 입력 상태
  const [isAdding, setIsAdding] = useState<boolean>(false); // 텍스트 입력 상태 여부

  // 각 메뉴 항목의 화면 위치를 저장하기 위한 ref
  const nodePositions = useRef<Map<number, DOMRect>>(new Map());
  const inputRef = useRef<HTMLInputElement | null>(null); // Add a ref for the input element
  const contextMenuRef = useRef<HTMLDivElement | null>(null); // Add a ref for the context menu
  const isBlurred = useRef<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        comAPIContext.showProgressBar();
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-code-tree`,
          {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
            params: { langCode: langCode } as any,
          }
        );

        if (res && res.data) {
          console.log('res.data', res.data);
          res.data.forEach((e: CodeItem) => {
            console.log('before :', e);
            e.defaultText =
              e.msgId != null && e.msgId > -1
                ? comAPIContext.$msgDefault(e.msgId)
                : e.defaultText;
            console.log('after : ', e);
          });
          setCodeData(res.data);
          console.log('codeData : ', codeData);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching data:', err);
        comAPIContext.showToast(
          'Error fetching roles: ' + error.message,
          'danger'
        );
      } finally {
        comAPIContext.hideProgressBar();
      }
    };

    fetchData();
  }, [refreshTree]);

  useEffect(() => {
    nodePositions.current = new Map(); // 기존 값 초기화

    codeData.forEach((node) => {
      setTimeout(() => {
        const element = document.getElementById(`menu-item-${node.codeId}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          nodePositions.current.set(node.codeId, rect);
        }
      }, 0);
    });
  }, [codeData]); // menuData가 변경될 때마다 실행

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const buildTree = (data: CodeItem[], parentId: number | null): CodeItem[] => {
    // console.log('data : ', data);
    // console.log('data.filter((item) => item.parentId === parentId) : ', data.filter((item) => item.parentId === parentId));
    const result = data
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(data, item.codeId),
      }));
    // console.log('result : ', result);
    return result;
  };

  const buildTreeWithRoot = (data: CodeItem[]): CodeItem[] => {
    const treeData = buildTree(data, 0);
    return [
      {
        codeId: -1,
        parentId: -1,
        codeName: 'Root',
        defaultText: 'Root',
        msgId: -1,
        level: 0,
        codeOrder: 1,
        status: '',
        createBy: '',
        createDate: '',
        updateBy: '',
        updateDate: '',
        isAdd: false,
        isDelete: false,
        children: treeData,
        acode: '',
        bcode: '',
        ccode: '',
        dcode: '',
        ecode: '',
      },
    ];
  };

  const treeData = buildTreeWithRoot(codeData);

  const toggleCodeVisibility = (codeId: number) => {
    if (visibleCodeIds.includes(codeId)) {
      setVisibleCodeIds(visibleCodeIds.filter((id) => id !== codeId));
    } else {
      setVisibleCodeIds([...visibleCodeIds, codeId]);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, node: CodeItem) => {
    event.preventDefault();
    event.stopPropagation();

    handleCodeClick(event, node);
  };

  const handleCodeClick = useCallback(
    (event: React.MouseEvent, node: CodeItem) => {
      const adjustedX = Math.max(event.clientX);
      const adjustedY = Math.max(event.clientY);

      console.log(node);

      setContextMenu({
        visible: true,
        x: adjustedX,
        y: adjustedY,
        node: node,
      });

      if (selectedCodeId !== node.codeId) {
        setSelectedCodeId(node.codeId);
        onCodeClick({ ...node, isAdd: false, isDelete: false });
      }
    },
    [selectedCodeId, onCodeClick]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleDeleteConfirm = () => {
    setShowModal(true);
  };

  // 삭제 불가 메뉴인지 확인하는 함수
  const isDeletable = (codeId: number): boolean => {
    return codeId !== -1; // 예시로 menuId가 -1인 Root 메뉴는 삭제할 수 없다고 가정
  };

  const handleDeleteMenu = async () => {
    // 자식 노드까지 다 삭제 alert Y, N
    if (contextMenu.node) {
      try {
        const data = {
          codeId: contextMenu.node.codeId,
        };

        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/delete-code`,
          data,
          {
            headers: {
              Authorization: `Bearer ${cachedAuthToken}`,
            },
          }
        );

        if (res.status === 200) {
          console.log(res);
          console.log('Code deleted successfully');
          setContextMenu({ ...contextMenu, visible: false });
          try {
            comAPIContext.showProgressBar();
            const res = await axios.get(
              `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-code-tree`,
              {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
                params: { langCode: langCode } as any,
              }
            );

            if (res && res.data) {
              setCodeData(res.data);
              setShowModal(false);
            }
          } catch (err) {
            const error = err as Error;
            console.error('Error fetching data:', err);
            comAPIContext.showToast(
              'Error fetching roles: ' + error.message,
              'danger'
            );
          } finally {
            comAPIContext.hideProgressBar();
          }
        }
      } catch (err) {
        console.error('Error deleting menu:', err);
      }
    }
  };
  // 삭제 모달에서 확인 버튼 클릭 시
  const handleConfirmDelete = async () => {
    handleDeleteMenu();
  };

  const handleBlur = async () => {
    if (isBlurred.current) return; // 중복 실행 방지
    isBlurred.current = true;

    if (inputText.length === 0) {
      setIsAdding(false);
    } else {
      console.log('db insert');
      console.log(contextMenu.node);
      console.log('inputText', inputText);

      const childData = contextMenu.node;

      const data = {
        codeId: -1,
        parentId: childData?.codeId === -1 ? 0 : childData?.codeId,
        codeName: '',
        defaultText: inputText,
        msgId: -1,
        level: (childData?.level ?? 0) + 1,
        codeOrder: 0,
        status: 'ACTIVE',
        createBy: state.user?.userId,
        createDate: '',
        updateBy: '',
        updateDate: '',
        isAdd: false,
        isDelete: false,
        acode: '',
        bcode: '',
        ccode: '',
        dcode: '',
        ecode: '',
      };

      try {
        comAPIContext.showProgressBar();
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/insert-code`,
          data,
          {
            headers: {
              Authorization: `Bearer ${cachedAuthToken}`,
            },
          }
        );

        console.log(res);
        comAPIContext.hideProgressBar();

        if (res.status === 200) {
          setIsAdding(false);
          setInputText('');
          try {
            comAPIContext.showProgressBar();
            const res = await axios.get(
              `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-code-tree`,
              {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
                params: { langCode: langCode } as any,
              }
            );

            if (res && res.data) {
              setCodeData(res.data);
              console.log(res);
            }
          } catch (err) {
            const error = err as Error;
            console.error('Error fetching data:', err);
            comAPIContext.showToast(
              'Error fetching roles: ' + error.message,
              'danger'
            );
          } finally {
            isBlurred.current = false;
            comAPIContext.hideProgressBar();
          }
        }
      } catch (err) {
        console.error('Error deleting code:', err);
      }
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.code === 'Enter') {
      event.preventDefault(); // 엔터 시 기본 동작 방지
      handleBlur();
    }
  };

  const renderTree = (nodes: CodeItem[], level = 0) => {
    return (
      <Container>
        <ul
          className="list-unstyled-item"
          style={{ marginBottom: 0, marginLeft: -30 }}
        >
          {nodes.map((node) => (
            <li
              key={node.codeId}
              className="list-group-item" // mb-3를 제거
              style={{ marginBottom: 0 }} // 인라인 스타일로 margin-bottom: 0 설정
              // onContextMenu={(event) => handleContextMenu(event, node)}
            >
              <div
                ref={(el) => {
                  if (el) {
                    setTimeout(() => {
                      const rect = el.getBoundingClientRect();
                      nodePositions.current.set(node.codeId, rect);
                    }, 0);
                  }
                }}
                className="list-item"
                style={{
                  marginLeft: `${level * 20}px`,
                  color:
                    selectedCodeId !== null && node.codeId === selectedCodeId
                      ? 'blue'
                      : 'black',
                }}
              >
                {node.children?.length! > 0 && (
                  <span
                    onClick={() => toggleCodeVisibility(node.codeId)}
                    className="tree_polygon"
                  >
                    {visibleCodeIds.includes(node.codeId) ? (
                      <img
                        alt="아래화살표"
                        src={`${process.env.REACT_APP_PUBLIC_URL}/assets/icons/polygon_down.svg`}
                      />
                    ) : (
                      <img
                        alt="우측측화살표"
                        src={`${process.env.REACT_APP_PUBLIC_URL}/assets/icons/polygon_right.svg`}
                      />
                    )}
                  </span>
                )}
                <span
                  onContextMenu={(event) => handleContextMenu(event, node)}
                  onClick={(event) => handleCodeClick(event, node)}
                  style={{ flex: 1 }}
                >
                  {node.defaultText}
                </span>
              </div>
              {visibleCodeIds.includes(node.codeId) &&
                node.children?.length! > 0 &&
                renderTree(node.children!, level + 1)}

              {isAdding && contextMenu.node?.codeId === node.codeId && (
                <div style={{ marginTop: '10px', marginLeft: '40px' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder="코드 이름을 입력하세요"
                    style={{ width: '100%' }}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Container>
    );
  };
  return (
    <div>
      {renderTree(treeData)}
      {contextMenu.visible && contextMenu.node && (
        <Dropdown.Menu
          show
          ref={contextMenuRef}
          style={{
            position: 'absolute',
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
            {codeData.find((item) => item.codeId === contextMenu?.node?.codeId)
              ?.defaultText || '/'}
          </Dropdown.Header>
          <Dropdown.Item
          // style={{ padding: "5px 10px", cursor: "pointer" }}
          // onClick={() => {
          //     setIsAdding(true);
          //     setContextMenu({ ...contextMenu, visible: false });
          // }}
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
              {comAPIContext.$msg('label', 'add', '추가')}
            </Button>
            <Button size="sm" variant="danger" onClick={handleDeleteConfirm}>
              {comAPIContext.$msg('label', 'delete', '삭제')}
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
          {isDeletable(selectedCodeId)
            ? '하위 메뉴까지 모두 삭제됩니다. 정말로 삭제하시겠습니까?'
            : 'Root 메뉴는 삭제할 수 없습니다.'}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            취소
          </Button>
          {isDeletable(selectedCodeId) ? (
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
    </div>
  );
};

export default ManageCodeTree;
