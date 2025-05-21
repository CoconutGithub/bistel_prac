import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { ChooseMenuData } from '~types/ChooseMenuData';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import ComButton from '~pages/portal/buttons/ComButton';
import MessageSelectPopup from '~pages/portal/admin/MessageSelectPopup';
import { AppDispatch, RootState } from '~store/Store';
import { useDispatch, useSelector } from 'react-redux';
import { ComAPIContext } from '~components/ComAPIContext';
import axios from 'axios';
import { cachedAuthToken } from '~store/AuthSlice';
import { setMenuItems } from '~store/MenuSlice';

interface Role {
  roleId: number;
  roleName: string;
}

interface ColumnDef {
  field: string;
  headerName: string;
  cellEditor?: string;
  sortable: boolean;
  filter: boolean;
  editable: boolean;
  width: number;
  hide: boolean;
  cellDataType?: string;
  valueGetter?: (params: any) => boolean;
  valueSetter?: (params: any) => boolean;
  cellEditorParams?: {
    values: string[];
  };
}

let roleKind: any = null;
// { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
let columnDefs: ColumnDef[] = [
  {
    field: 'gridRowId',
    headerName: 'gridRowId',
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
    hide: true,
  },
  {
    field: 'roleName',
    headerName: '역할',
    cellEditor: 'agSelectCellEditor',
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
    hide: false,
  },
  {
    field: 'canCreate',
    headerName: '생성 권한',
    cellDataType: 'boolean',
    valueGetter: (params: any) => {
      return params.data.canCreate === 'Y' ? true : false;
    },
    valueSetter: (params: any) => {
      const newValue: boolean = params.newValue;
      params.data.canCreate = newValue ? 'Y' : 'N';
      return true;
    },
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
    hide: false,
  },
  {
    field: 'canRead',
    headerName: '읽기 권한',
    cellDataType: 'boolean',
    valueGetter: (params: any) => {
      return params.data.canRead === 'Y' ? true : false;
    },
    valueSetter: (params: any) => {
      const newValue: boolean = params.newValue;
      params.data.canRead = newValue ? 'Y' : 'N';
      return true;
    },
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
    hide: false,
  },
  {
    field: 'canUpdate',
    headerName: '수정 권한',
    cellDataType: 'boolean',
    valueGetter: (params: any) => {
      return params.data.canUpdate === 'Y' ? true : false;
    },
    valueSetter: (params: any) => {
      const newValue: boolean = params.newValue;
      params.data.canUpdate = newValue ? 'Y' : 'N';
      return true;
    },
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
    hide: false,
  },
  {
    field: 'canDelete',
    headerName: '삭제 권한',
    cellDataType: 'boolean',
    valueGetter: (params: any) => {
      return params.data.canDelete === 'Y' ? true : false;
    },
    valueSetter: (params: any) => {
      const newValue: boolean = params.newValue;
      params.data.canDelete = newValue ? 'Y' : 'N';
      return true;
    },
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
    hide: false,
  },
  {
    field: 'createDate',
    headerName: '생성일',
    sortable: true,
    filter: true,
    editable: false,
    width: 150,
    hide: false,
  },
  {
    field: 'createBy',
    headerName: '생성자',
    sortable: true,
    filter: true,
    editable: false,
    width: 100,
    hide: false,
  },
  {
    field: 'updateDate',
    headerName: '수정일',
    sortable: true,
    filter: false,
    editable: false,
    width: 150,
    hide: false,
  },
  {
    field: 'updateBy',
    headerName: '수정자',
    sortable: true,
    filter: true,
    editable: false,
    width: 100,
    hide: false,
  },
];

const ManageMenuContent: React.FC<{
  chooseMenuData: ChooseMenuData | null;
  onSave: () => void;
}> = ({ chooseMenuData, onSave }) => {
  console.log('ManageMenuContent 생성됨.');

  const [isActive, setIsActive] = useState<string>('INACTIVE');
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [position, setPosition] = useState<number | any>(
    chooseMenuData?.position
  );
  const [path, setPath] = useState<string | any>(chooseMenuData?.path);
  const [menuName, setMenuName] = useState<string | any>(
    chooseMenuData?.menuName
  ); // menuName state 관리
  const state = useSelector((state: RootState) => state.auth);
  const isMighty = useSelector((state: RootState) => state.auth.user.isMighty);
  const roleId = useSelector((state: RootState) => state.auth.user.roleId);
  const langCode = useSelector((state: RootState) => state.auth.user.langCode ?? 'ko');
  const comAPIContext = useContext(ComAPIContext);
  const pathRef = useRef<HTMLInputElement>(null);
  const [msgId, setMsgId] = useState<number>(0);
  const menuNameRef = useRef<HTMLInputElement>(null);
  const [menuId, setMenuId] = useState<string | any>(chooseMenuData?.menuId);
  const [rowData, setRowData] = useState<any[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  console.log('chooseMenuData', chooseMenuData);

  useEffect(() => {
    if (chooseMenuData) {
      setPosition(Number(chooseMenuData?.position));
      setPath(chooseMenuData?.path);
      setMenuName(chooseMenuData?.menuName); 
      setMsgId(chooseMenuData?.msgId);
      setIsActive(chooseMenuData?.status ?? 'INACTIVE');
      fetchData();
      setMenuId(chooseMenuData.menuId);
    }
  }, [chooseMenuData]);

  useEffect(() => {
    const setDefColumn = () => {
      columnDefs.forEach((column) => {
        if (column.headerName === '역할') {
          column.headerName = comAPIContext.$msg('label', 'role', '역할');
        } else if (column.headerName === '읽기 권한') {
          column.headerName = comAPIContext.$msg(
            'label',
            'search_permission',
            '읽기 권한'
          );
        } else if (column.headerName === '수정 권한') {
          column.headerName = comAPIContext.$msg(
            'label',
            'update_permission',
            '수정 권한'
          );
        } else if (column.headerName === '생성 권한') {
          column.headerName = comAPIContext.$msg(
            'label',
            'create_permission',
            '생성 권한'
          );
        } else if (column.headerName === '삭제 권한') {
          column.headerName = comAPIContext.$msg(
            'label',
            'delete_permission',
            '삭제 권한'
          );
        } else if (column.headerName === '생성일') {
          column.headerName = comAPIContext.$msg(
            'label',
            'create_date',
            '생성일'
          );
        } else if (column.headerName === '생성자') {
          column.headerName = comAPIContext.$msg('label', 'creator', '생성자');
        } else if (column.headerName === '수정일') {
          column.headerName = comAPIContext.$msg(
            'label',
            'update_date',
            '수정일'
          );
        } else if (column.headerName === '수정자') {
          column.headerName = comAPIContext.$msg('label', 'editor', '수정자');
        }
      });
    };
    setDefColumn();

    getRoleListData();
  }, []);

  const getRoleListData = async () => {
    try {
      comAPIContext.showProgressBar();
      const res = await axios.get<Role[]>(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-roles-list`,
        {
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
          },
        }
      );

      const roleList = res.data;

      roleKind = res.data;

      console.log('roleList ============================>', roleList);

      columnDefs = columnDefs.map((col) => {
        if (col.field === 'roleName') {
          return {
            ...col,
            cellEditorParams: {
              values: roleList.map((role: Role) => role.roleName),
            },
            valueSetter: (params: any) => {
              const newRoleName = params.newValue;
              const selectedRole = roleList.find(
                (role) => role.roleName === newRoleName
              );

              if (selectedRole) {
                params.data.roleId = selectedRole.roleId;
                params.data.roleName = selectedRole.roleName;
                return true;
              }
              return false;
            },
          };
        }
        return col;
      });
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      const errorMessage =
        error.response?.data || error.message || 'Unknown error';
      comAPIContext.showToast(
        'Error fetching roles: ' + errorMessage,
        'danger'
      );
    } finally {
      comAPIContext.hideProgressBar();
    }
  };

  const fetchData = async () => {
    try {
      comAPIContext.showProgressBar();
      if (chooseMenuData !== null) {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-menu-role`,
          {
            headers: {
              Authorization: `Bearer ${cachedAuthToken}`,
            },
            params: {
              menuIdStr: chooseMenuData?.menuId,
            },
          }
        );

        if (gridRef.current && response.data !== '조회된 데이터가 없습니다') {
          gridRef.current.setRowData(response.data);
          setRowData(response.data);
        } else {
          gridRef?.current?.setRowData([]);
          setRowData([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      const errorMessage =
        error.response?.data || error.message || 'Unknown error';
      comAPIContext.showToast(
        'Error fetching roles: ' + errorMessage,
        'danger'
      );
    } finally {
      comAPIContext.hideProgressBar();
    }
  };

  const handleSave = async () => {
    console.log("메뉴 저장 (신규 vs 수정) 분기 처리 시작");

    const pathValue = pathRef?.current?.value; // ref로 저장된 값을 가져옴
    const menuNameValue = menuNameRef?.current?.value;

    const data = {
      menuName: menuNameValue,
      path: pathValue,
      position: position === '' ? 0 : position,
      status: isActive,
      userId: state.user?.userId,
      menuId: menuId,
      msgId: msgId,
    };

    console.log(data);

    try {
      comAPIContext.showProgressBar();
      await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/update-menu-content`,
        data,
        {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        }
      );
      comAPIContext.hideProgressBar();
      alert("Save successfully!");
      onSave();
      await axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/menu`, {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
        params: {
          roleId,
          isMighty,
          langCode,
        },
      })
      .then((res) => {
        const menuInfo = res.data.menuInfo || []
        dispatch(setMenuItems(menuInfo));
      })
      .catch((error) => {
        console.error('Header 메뉴 로드 실패:', error);
      });
    } catch (error) {
      console.error("Error saving menu:", error);
      comAPIContext.hideProgressBar();
      alert("Failed to save menu");
    }
  };

  const openModal = () => {
    setShowPopup(true);
  };

  const selectMessage = (msgId: number, msgDefault: string) => {
    console.log(msgId, msgDefault);
    setMsgId(msgId);
    setMenuName(msgDefault);
    setShowPopup(false);
  };

  const handleGridSave = async (lists: {
    deleteList: any[];
    updateList: any[];
    createList: any[];
  }) => {
    if (!gridRef.current) return;

    if (
      lists.deleteList.length === 0 &&
      lists.updateList.length === 0 &&
      lists.createList.length === 0
    ) {
      comAPIContext.showToast(
        comAPIContext.$msg(
          'message',
          'no_save_data',
          '저장할 데이터가 없습니다.'
        ),
        'dark'
      );
      return;
    }

    try {
      comAPIContext.showProgressBar();

      if (lists.createList?.length > 0) {
        for (const obj of lists.createList) {
          if (obj.roleName === undefined) {
            comAPIContext.showToast(
              comAPIContext.$msg(
                'message',
                'select_role',
                '권한 이름을 선택해주세요.'
              ),
              'dark'
            );
            return;
          }
        }
      }

      lists.createList.map((r) => {
        r.menuId = menuId;
        r.userId = state.user?.userId;
      });

      lists.updateList.map((r) => {
        r.menuId = chooseMenuData?.menuId;
        r.userId = state.user?.userId;
        const roleData: any = roleKind.find(
          (e: any) => e.roleName === r.roleName
        );
        r.roleId = roleData.roleId;
      });

      lists.deleteList.map((r) => {
        r.menuId = chooseMenuData?.menuId;
        const roleData: any = roleKind.find(
          (e: any) => e.roleName === r.roleName
        );
        r.roleId = roleData.roleId;
      });

      // 전송 데이터 구성
      const payload = {
        updateList: lists.updateList,
        deleteList: lists.deleteList,
        createList: lists.createList,
      };

      await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/update-menu-role`,
        payload,
        {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        }
      );

      comAPIContext.showToast(
        comAPIContext.$msg('message', 'save_complete', '저장이 완료됐습니다.')
      );
      fetchData(); // 저장 후 최신 데이터 조회
    } catch (err) {
      console.error('Error saving data:', err);
      comAPIContext.showToast(
        comAPIContext.$msg('message', 'save_fail', '저장이 실패했습니다.'),
        'danger'
      );
      fetchData();
    } finally {
      comAPIContext.hideProgressBar();
    }
  };

  return (
    <Container fluid>
      {chooseMenuData && chooseMenuData.menuName !== 'Root' ? (
        <>
          <h4 className="cnt_title">
            Selected Menu
          </h4>
          <Form>
            {/* Menu Name */}
            <Form.Group className="form_group align-items-center">
              <Form.Label column sm={2}>
                Menu Name:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                    type="text"
                    value={menuName || ""} // menuName 상태값 사용
                    size="sm"
                    onChange={e => setMenuName(e.target.value)}
                    disabled={!chooseMenuData?.isNew}
                    readOnly={!chooseMenuData?.isNew}
                />
              </Col>
              <Col sm={3}>
                <ComButton onClick={openModal}>
                  {comAPIContext.$msg("label", "메시지 할당", "메시지 할당")}
                </ComButton>
              </Col>
            </Form.Group>

            {/* Msg Id */}
            <Form.Group className="form_group align-items-center">
              <Form.Label column sm={2}>
                Msg Id:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={msgId || ''} // path 상태값 사용
                  size="sm"
                  disabled
                  readOnly
                />
              </Col>
            </Form.Group>

            {/* Menu ID */}
            <Form.Group className="form_group align-items-center">
              <Form.Label column sm={2}>
                Menu ID:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={menuId}
                  size="sm"
                  disabled
                  readOnly
                />
              </Col>
            </Form.Group>

            {/* Parent Menu ID */}
            <Form.Group className="form_group align-items-center">
              <Form.Label column sm={2}>
                Parent Menu ID:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={chooseMenuData.parentMenuId}
                  size="sm"
                  disabled
                  readOnly
                />
              </Col>
            </Form.Group>

            <Form.Group className="form_group align-items-center">
              <Form.Label column sm={2}>
                Position:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="number"
                  value={position ?? ''}
                  max={9999}
                  size="sm"
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="0"
                />
              </Col>
            </Form.Group>

            {/* Menu Path */}
            <Form.Group className="form_group align-items-center">
              <Form.Label column sm={2}>
                Menu Path:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  ref={pathRef} // ref로 직접 접근
                  value={path || ''} // path 상태값 사용
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setPath(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* Status */}
            <Form.Group className="form_group align-items-center">
              <Form.Label column sm={2}>
                Status:
              </Form.Label>
              <Col sm={4}>
                <div>
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    label={isActive ? 'Active ON' : 'Active OFF'}
                    checked={isActive === 'INACTIVE' ? false : true}
                    onChange={() => {
                      const newValue = isActive === 'INACTIVE' ? true : false;
                      const status = newValue ? 'ACTIVE' : 'INACTIVE';
                      setIsActive(status);
                    }}
                  />
                </div>
              </Col>
            </Form.Group>
            {/* 저장 버튼 */}
            <Form.Group className="form_group">
              <Col sm={{ span: 4, offset: 2 }} className="btn_wrap">
                <ComButton onClick={handleSave} className="w-100">
                  {comAPIContext.$msg('label', 'save', '저장')}
                </ComButton>
              </Col>
            </Form.Group>
          </Form>
          <div
            className="role-grid-wrapper"
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '20px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {comAPIContext.$msg('label', 'role', '역할') +
                    comAPIContext.$msg('label', 'add', '추가')}
                </span>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  ({rowData.length})
                </span>
              </div>
            </div>

            <AgGridWrapper
              ref={gridRef}
              showButtonArea={true}
              columnDefs={columnDefs}
              enableCheckbox={true}
              canCreate={true}
              canDelete={true}
              canUpdate={true}
              onSave={handleGridSave}
              hideTitle={true}
            />
          </div>
        </>
      ) : (
        <div>
          <h5>No Menu Selected</h5>
          <p>Please select a menu to see the details.</p>
        </div>
      )}
      <MessageSelectPopup
        show={showPopup}
        onClose={() => setShowPopup(false)}
        selectMessage={(msgId, msgDefault) => selectMessage(msgId, msgDefault)}
      />
    </Container>
  );
};

export default ManageMenuContent;
