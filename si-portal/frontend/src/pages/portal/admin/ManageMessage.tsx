import React, {useState, useContext, useRef, useCallback, useEffect, useMemo,} from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~store/Store";
import { AgGridWrapperHandle } from "~types/GlobalTypes"; // 팝업 컴포넌트 가져오기
import ComButton from "../buttons/ComButton";
import { cachedAuthToken } from "~store/AuthSlice";

const columnDefs = [
  {
    field: "msgId",
    headerName: "ID",
    editable: false,
    hide: true,
    sortable: false,
    filter: false,
  },
  {
    field: "msgType",
    headerName: "타입",
    sortable: true,
    filter: true,
    editable: true,
    width: 100,
  },
  {
    field: "msgName",
    headerName: "메세지명",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "msgDefault",
    headerName: "기본값",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "status",
    headerName: "상태",
    sortable: true,
    filter: true,
    editable: true,
    width: 100,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["ACTIVE", "INACTIVE"], // 상태 값 목록
    },
  },
  {
    field: "koLangText",
    headerName: "한국어",
    sortable: true,
    filter: true,
    editable: true,
    width: 200,
  },
  {
    field: "enLangText",
    headerName: "영어",
    sortable: true,
    filter: true,
    editable: true,
    width: 200,
  },
  {
    field: "cnLangText",
    headerName: "중국어",
    sortable: true,
    filter: true,
    editable: true,
    width: 200,
  },
  {
    field: "createDate",
    headerName: "생성일",
    sortable: true,
    filter: true,
    editable: false,
    width: 200,
  },
  {
    field: "createBy",
    headerName: "생성자",
    sortable: true,
    filter: true,
    editable: false,
    width: 100,
  },
  {
    field: "updateDate",
    headerName: "업데이트일",
    sortable: true,
    filter: false,
    width: 200,
  },
  {
    field: "updateBy",
    headerName: "수정자",
    sortable: true,
    filter: true,
    editable: false,
    width: 100,
  },
];

const ManageMessage: React.FC = () => {
  console.log("ManageSchedule 생성됨.");

  //==start: 여기는 무조건 공통으로 받는다고 생각하자
  const state = useSelector((state: RootState) => state.auth);
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
  const comAPIContext = useContext(ComAPIContext);
  //==end: 여기는 무조건 공통으로 받는다고 생각하자

  const langCode = useSelector((state: RootState) => state.auth.user.langCode);
  console.log("stat", state);

  const msgNameRef = useRef<HTMLInputElement>(null);
  const msgDefaulteRef = useRef<HTMLInputElement>(null);
  const koLangTextRef = useRef<HTMLInputElement>(null);
  const enLangTextRef = useRef<HTMLInputElement>(null);
  const cnLangTextRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    comAPIContext.showProgressBar();
    axios
      .get("http://localhost:8080/admin/api/get-msg-type", {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
        params: { status: "ACTIVE" },
      })
      .then((res) => {
        console.log("res", res);
        setTypeList(res.data.map((e: any) => e.msgType));
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        comAPIContext.showToast("Error fetching data: " + err, "danger");
      })
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  }, []);

  const handleSearch = async () => {
    console.log("state", state);
    console.log("메세지 가져오기 테스트: ", comAPIContext.$msg( "label", "cancel", "취소얌"));
    comAPIContext.showProgressBar();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const params = { msgType: selectedType
      , status: selectedStatus
      , msgName: msgNameRef.current?.value
      , msgDefault: msgDefaulteRef.current?.value
      , koLangText: koLangTextRef.current?.value
      , enLangText: enLangTextRef.current?.value
      , cnLangText: cnLangTextRef.current?.value
    };
    console.log("params:", params);

    axios
      .get("http://localhost:8080/admin/api/get-msg-list", {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },        
        params: params,
      })
      .then((res) => {
        console.log("res", res);
        if (gridRef.current) {
          res.data.forEach((e: any) => {
            e.gridRowId = e.msgId;
          });
          gridRef.current.setRowData(res.data); // 데이터를 AgGridWrapper에 설정;
        }
        comAPIContext.hideProgressBar();
        comAPIContext.showToast("조회가 완료됐습니다.", "success");
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        comAPIContext.showToast("Error Job Search: " + err, "danger");
      })
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  const handleSave = async (lists: {
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
      comAPIContext.showToast("저장할 데이터가 없습니다.", "dark");
      return;
    }

    try {
      comAPIContext.showProgressBar();
      console.log("1.update 행들:", lists.updateList);
      console.log("2.delete 행들:", lists.deleteList);
      console.log("3.create 행들:", lists.createList);

      if (lists.updateList?.length > 0) {
        for (const obj of lists.updateList) {
          if (
            obj.msgType === undefined ||
            obj.msgType === null ||
            typeof obj.msgType !== "string" ||
            obj.msgType.trim().length == 0 ||
            obj.msgName === undefined ||
            obj.msgName === null ||
            typeof obj.msgName !== "string" ||
            obj.msgName.trim().length == 0 ||
            obj.msgDefault === undefined ||
            obj.msgDefault === null ||
            typeof obj.msgDefault !== "string" ||
            obj.msgDefault.trim().length == 0 
          ) {
            comAPIContext.showToast("타입, 메세지명, 기본값 항목을 모두 입력해주세요.", "dark");
            return;
          }          
        }
      }
      if (lists.createList?.length > 0) {
        for (const obj of lists.createList) {
          if (
            obj.msgType === undefined ||
            obj.msgType === null ||
            typeof obj.msgType !== "string" ||
            obj.msgType.trim().length == 0 ||
            obj.msgName === undefined ||
            obj.msgName === null ||
            typeof obj.msgName !== "string" ||
            obj.msgName.trim().length == 0 ||
            obj.msgDefault === undefined ||
            obj.msgDefault === null ||
            typeof obj.msgDefault !== "string" ||
            obj.msgDefault.trim().length == 0 
          ) {
            comAPIContext.showToast("타입, 메세지명, 기본값 항목을 모두 입력해주세요.", "dark");
            return;
          }   
        }
      }
      // 전송 데이터 구성
      const payload = {
        updateList: lists.updateList,
        deleteList: lists.deleteList,
        createList: lists.createList,
        userId: state.user?.userId,
      };
      console.log("payload:", payload);

      const response = await axios.post(
        "http://localhost:8080/admin/api/update-msg-list",
        payload,
        {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        }
      );
      console.log("response:", response);

      if (response.data.messageCode === "success") {
        comAPIContext.showToast(response.data.message, "success");
      } else {
        comAPIContext.showToast(
          response.data.message + " (" + response.data.errorList.join() + ")",
          "danger"
        );
      }

      handleSearch(); // 저장 후 최신 데이터 조회
    } catch (err) {
      console.error("Error saving data:", err);
      comAPIContext.showToast(
        "저장 중 오류가 발생했습니다.",
        "danger"
      );
    } finally {
      comAPIContext.hideProgressBar();
    }
  };
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value);
    console.log("event.target.value:", event.target.value);
    console.log("selectedType:", selectedType);
  };
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
    console.log("event.target.value:", event.target.value);
    console.log("selectedStatus:", selectedStatus);
  };
  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <h2>메세지 관리</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg={11}>
          <Form.Group as={Row}>
            <Form.Label column sm={1} className="text-center">
              메세지 타입
            </Form.Label>
            <Col sm={2}>
              <Form.Select value={selectedType} onChange={handleTypeChange}>
                <option value="">타입 선택</option>
                {typeList.map((option:string, index:any) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Col>            
            <Form.Label column sm={1} className="text-center">
              메세지명
            </Form.Label>
            <Col sm={2}>
              <Form.Control ref={msgNameRef} type="text" placeholder="status" />
            </Col>
            <Form.Label column sm={1} className="text-center">
              기본값
            </Form.Label>
            <Col sm={2}>
              <Form.Control ref={msgDefaulteRef} type="text" placeholder="status" />
            </Col>
            <Form.Label column sm={1} className="text-center">
              적용 상태
            </Form.Label>
            <Col sm={2}>
              <Form.Select value={selectedStatus} onChange={handleStatusChange}>
                <option value="">상태 선택</option>
                {["ACTIVE", "INACTIVE"].map((option:string, index:any) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Form.Label column sm={1} className="text-center">
              한국어
            </Form.Label>
            <Col sm={2}>
              <Form.Control ref={koLangTextRef} type="text" placeholder="한국어" />
            </Col>
            <Form.Label column sm={1} className="text-center">
              영어
            </Form.Label>
            <Col sm={2}>
              <Form.Control ref={enLangTextRef} type="text" placeholder="English" />
            </Col>
            <Form.Label column sm={1} className="text-center">
              중국어
            </Form.Label>
            <Col sm={2}>
              <Form.Control ref={cnLangTextRef} type="text" placeholder="中国话" />
            </Col>
          </Form.Group>
        </Col>
        <Col lg={1}>
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
            canCreate={canCreate}
            canDelete={canDelete}
            canUpdate={canUpdate}
            columnDefs={columnDefs}
            enableCheckbox={true}
            onSave={handleSave} // 저장 버튼 동작
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ManageMessage;