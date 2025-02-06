import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import { useSelector } from "react-redux";
import { ComAPIContext } from "~components/ComAPIContext";
import axios from "axios";
import { RootState } from "~store/Store";
import UserRegistPopup from "~pages/portal/admin/UserRegistPopup";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import ComButton from "~pages/portal/buttons/ComButton"; // 팝업 컴포넌트 가져오기
import { cachedAuthToken } from "~store/AuthSlice";

// 컬럼 정의
const columnDefs = [
  { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
  {
    field: "userId",
    headerName: "ID",
    sortable: true,
    filter: true,
    editable: false,
    width: 100,
  },
  {
    field: "userName",
    headerName: "이름",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "email",
    headerName: "이메일",
    sortable: true,
    filter: true,
    editable: true,
    width: 200,
  },
  {
    field: "phoneNumber",
    headerName: "전화번호",
    sortable: true,
    filter: true,
    editable: true,
    width: 200,
  },
  {
    field: "roleName",
    headerName: "역할",
    sortable: true,
    filter: true,
    editable: true,
    width: 120,
    cellEditor: "agSelectCellEditor", // Combobox 설정
    cellEditorParams: { values: [] }, // 동적으로 role이 가져와질 Combobox 옵션
  },
  {
    field: "status",
    headerName: "상태",
    sortable: true,
    filter: true,
    editable: true,
    width: 100,
    cellEditor: "agSelectCellEditor", // Combobox 설정
    cellEditorParams: { values: ["ACTIVE", "INACTIVE"] }, // Combobox 옵션
  },
  {
    field: "createDate",
    headerName: "생성일",
    sortable: true,
    width: 200,
    filter: true,
  },
  {
    field: "lastLoginDate",
    headerName: "최근접속일",
    sortable: true,
    width: 200,
    filter: true,
  },
  {
    field: "updateDate",
    headerName: "수정일",
    sortable: true,
    width: 200,
    filter: true,
  },
  {
    field: "updateBy",
    headerName: "수정자",
    sortable: true,
    width: 200,
    filter: true,
  },
];

interface Role {
  roleId: number;
  roleName: string;
}

let roleKind: any = null;

const ManageUser: React.FC = () => {
  console.log("ManageUser 생성됨.");

  //=== 설정된 값 및 버튼 정보, 공통함수 가져옴-start ===
  const comAPIContext = useContext(ComAPIContext);
  const canCreate = useSelector(
      (state: RootState) => state.auth.pageButtonAuth.canCreate
  );
  const canDelete = useSelector(
      (state: RootState) => state.auth.pageButtonAuth.canDelete
  );
  const canUpdate = useSelector(
      (state: RootState) => state.auth.pageButtonAuth.canUpdate
  );
  const canRead = useSelector(
      (state: RootState) => state.auth.pageButtonAuth.canRead
  );
  //=== 설정된 값 및 버튼 정보, 공통함수 가져옴-end ===

  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const userRegisterRef = useRef<any>(null);

  const [dynamicColumnDefs, setDynamicColumnDefs] = useState(columnDefs); // 컬럼 정보

  useEffect(() => {
    const getRoleList = async () => {
      try {
        comAPIContext.showProgressBar();

        // API 호출
        const res = await axios.get(
            "http://localhost:8080/admin/api/get-roles-list",
            {
              headers: {
                Authorization: `Bearer ${cachedAuthToken}`,
              },
            }
        );

        if (res && res.data) {
          // 기존 columnDefs 복사 후 특정 컬럼 업데이트
          const updatedColumnDefs: any = columnDefs.map((col) => {
            if (col.field === "roleName") {
              return {
                ...col,
                cellEditorParams: {
                  values: res.data.map((item: any) => item.roleName),
                },
              };
            }
            return col; // 반드시 반환
          });

          // console.log("DBSearch Role 기준정보: ", res.data);
          roleKind = res.data;
          setDynamicColumnDefs(updatedColumnDefs); // 상태 업데이트
        }
      } catch (err) {
        const error = err as Error; // 타입 단언
        console.error("Error fetching data:", err);
        comAPIContext.showToast(
            "Error fetching roles: " + error.message,
            "danger"
        );
      } finally {
        comAPIContext.hideProgressBar();
      }
    };

    getRoleList();
  }, []);

  const handleSearch = () => {
    comAPIContext.showProgressBar();
    axios
        .get("http://localhost:8080/admin/api/get-user", {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
          params: { userName: inputRef.current?.value || "" },
        })
        .then((res) => {
          console.log("응답 데이터:", res.data); // 응답 데이터 콘솔 출력

          if (gridRef.current) {
            gridRef.current.setRowData(res.data); // 데이터를 AgGridWrapper에 설정
          }
          comAPIContext.hideProgressBar();
          comAPIContext.showToast("조회가 완료됐습니다.", "success");
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          comAPIContext.showToast("Error User Search: " + err, "danger");
        })
        .finally(() => {
          comAPIContext.hideProgressBar();
        });
  };

  const openPopup = useCallback(() => {
    if (userRegisterRef.current) {
      userRegisterRef.current.openModalPopup();
    }
  }, []);

  const refreshData = useCallback(() => {
    if (userRegisterRef.current) {
      handleSearch();
    }
  }, []);

  const handleSave = useCallback(
      (lists: { deleteList: any[]; updateList: any[] }) => {
        console.log("--------->", roleKind);

        if (!gridRef.current) return;

        if (lists.deleteList.length === 0 && lists.updateList.length === 0) {
          comAPIContext.showToast("저장할 데이터가 없습니다.", "dark");
          return;
        }

        try {
          comAPIContext.showProgressBar();
          // console.log("1.update 행들:", lists);
          // console.log("2.delete 행들:", lists);

          if (lists.updateList.length !== 0) {
            if (roleKind !== null) {
              lists.updateList.forEach((e) => {
                const roleData: any = roleKind.find(
                    (r: any) => r.roleName === e.roleName
                );
                e.roleId = roleData.roleId;
              });
            }
          }

          // 전송 데이터 구성
          const payload = {
            updateList: lists.updateList,
            deleteList: lists.deleteList,
          };

          axios.post(
              "http://localhost:8080/admin/api/update-user",
              payload,
              {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
              }
          ).then((res) => {
            debugger
            if (res.data.messageCode === 'success') {
              comAPIContext.showToast(
                  "모든 작업이 성공적으로 처리되었습니다."
                  + `(update: ${res.data.updatedUsersCnt}, delete: ${res.data.deletedUsersCnt})`,
                  "success"
              );

              handleSearch(); // 저장 후 최신 데이터 조회
            }
          });

        } catch (err) {
          console.error("Error saving data:", err);
          comAPIContext.showToast("저장 중 오류가 발생했습니다.", "danger");
          handleSearch();
        } finally {
          comAPIContext.hideProgressBar();
        }
      },
      []
  );

  const registerButton = useCallback(() => {
    return (
        <>
          <ComButton
              size="sm"
              className="me-2"
              variant="primary"
              onClick={openPopup}
              disabled={!canCreate}
          >
            사용자 등록
          </ComButton>
        </>
    );
  }, [openPopup, canCreate]);

  return (
      <Container fluid>
        <Row className="mb-3">
          <Col>
            <h2>사용자 관리</h2>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col lg={9}>
            <Form.Group as={Row}>
              <Form.Label column sm={1} className="text-center">
                사용자 이름
              </Form.Label>
              <Col sm={2}>
                <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="사용자 이름 입력"
                />
              </Col>
            </Form.Group>
          </Col>
          <Col lg={3} className="d-flex justify-content-end">
            <ComButton size="sm" variant="primary" onClick={handleSearch}>
              검색
            </ComButton>
          </Col>
        </Row>
        <div style={{ borderTop: "1px solid black", margin: "15px 0" }}></div>
        <Row>
          <Col>
            <AgGridWrapper
                ref={gridRef} // forwardRef를 통해 연결된 ref
                showButtonArea={true}
                canCreate={false}
                canDelete={canDelete}
                canUpdate={canUpdate}
                columnDefs={dynamicColumnDefs}
                enableCheckbox={true}
                onSave={handleSave} // 저장 버튼 동작z`
            >
              {registerButton()}
            </AgGridWrapper>
          </Col>
        </Row>
        <UserRegistPopup onResearchUser={refreshData} ref={userRegisterRef} />
      </Container>
  );
};

export default ManageUser;
