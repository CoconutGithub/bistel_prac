import React, { useState, useEffect, useContext, useRef } from "react";
import { Modal, Form, Col, Row } from "react-bootstrap";
import ComButton from "~pages/portal/buttons/ComButton";
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import { AgGridWrapperHandle } from "~types/GlobalTypes"; // 팝업 컴포넌트 가져오기
import { cachedAuthToken } from "~store/AuthSlice";
import axios from "axios";

interface MessageSelectPopupProps {
  show: boolean; // 팝업 표시 여부
  onClose: () => void; // 팝업 닫기 핸들러
  selectMessage: (msgId: number, msgDefault: string) => void; // Save 핸들러
}

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
    editable: false,
    width: 100,
    cellEditor: "agSelectCellEditor", // Combobox 설정
    cellEditorParams: { values: ["label", "menu", "message"] }, // Combobox 옵션
  },
  {
    field: "msgName",
    headerName: "메세지명",
    sortable: true,
    filter: true,
    editable: false,
    width: 150,
  },
  {
    field: "msgDefault",
    headerName: "기본값",
    sortable: true,
    filter: true,
    editable: false,
    width: 150,
  },
  {
    field: "status",
    headerName: "상태",
    sortable: true,
    filter: true,
    editable: false,
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
    editable: false,
    width: 200,
  },
  {
    field: "enLangText",
    headerName: "영어",
    sortable: true,
    filter: true,
    editable: false,
    width: 200,
  },
  {
    field: "cnLangText",
    headerName: "중국어",
    sortable: true,
    filter: true,
    editable: false,
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

const RoleRegistPopup: React.FC<MessageSelectPopupProps> = ({
  show,
  onClose,
  selectMessage,
}) => {
  const comAPIContext = useContext(ComAPIContext);
  const [roleName, setRoleName] = useState("");
  const [status, setStatus] = useState("ACTIVE"); // 기본값 'ACTIVE'
  const [selectedType, setSelectedType] = useState<string>("");
  const [typeList, setTypeList] = useState<any[]>([]);
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const msgNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!show) {
      setRoleName(""); // 팝업이 닫힐 때 roleName 초기화
    }
  }, [show]);

  useEffect(() => {
    comAPIContext.showProgressBar();
    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/admin/api/get-msg-type`, {
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
    comAPIContext.showProgressBar();
    await new Promise((resolve) => setTimeout(resolve, 500));
    const params = {
      msgType: selectedType,
      msgName: msgNameRef.current?.value,
    };
    console.log("params:", params);

    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/admin/api/get-msg-list`, {
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

  const handleSelect = () => {
    // 선택된 행들을 가져옵니다.
    const selectedRows = gridRef.current?.gridApi?.getSelectedRows();

    console.log(selectedRows);

    // 선택된 행이 있을 경우
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row: any) => {
        console.log("Selected Row Data:", row); // 선택된 행의 데이터 출력
        // 예시로, 선택된 메시지 ID와 기본값을 부모 컴포넌트로 전달
        selectMessage(row.msgId, row.msgDefault);
      });
    } else {
      console.log("No rows selected.");
      comAPIContext.showToast("선택된 row가 없습니다", "danger");
    }
    // onClose(); // 팝업 닫기
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value);
    console.log("event.target.value:", event.target.value);
    console.log("selectedType:", selectedType);
  };

  const onCellDoubleClicked = (event: any) => {
    console.log("double click", event);
    selectMessage(event.data.msgId, event.data.msgDefault);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {comAPIContext.$msg("label", "메시지 할당", "메시지 할당")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row} className="mb-3 d-flex align-items-center">
            <Form.Label column sm={2} className="text-end">
              <strong>
                {comAPIContext.$msg("label", "MSG TYPE", "MSG TYPE")}
              </strong>
            </Form.Label>
            <Col sm={3}>
              <Form.Select value={selectedType} onChange={handleTypeChange}>
                <option value="">타입 선택</option>
                {typeList.map((option: string, index: any) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Form.Label column sm={2} className="text-end">
              <strong>
                {comAPIContext.$msg("label", "MESSAGE NAME", "MESSAGE NAME")}
              </strong>
            </Form.Label>
            <Col sm={3} className="d-flex align-items-center">
              <Form.Control
                type="text"
                ref={msgNameRef}
                placeholder="Input Message Name"
              />
              <ComButton
                variant="primary"
                onClick={handleSearch}
                className="ms-2"
              >
                {comAPIContext.$msg("label", "Search", "Search")}
              </ComButton>
            </Col>
            <Col>
              <AgGridWrapper
                ref={gridRef} // forwardRef를 통해 연결된 ref
                showButtonArea={false}
                columnDefs={columnDefs}
                onCellDoubleClicked={onCellDoubleClicked}
                enableCheckbox={true}
                tableHeight="400px"
                rowSelection="single"
              />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <ComButton variant="primary" onClick={handleSelect}>
          {comAPIContext.$msg("label", "select", "선택")}
        </ComButton>
        <ComButton
          variant="secondary"
          onClick={() => {
            setRoleName(""); // Close 버튼 클릭 시 roleName 초기화
            onClose();
          }}
        >
          Close
        </ComButton>
      </Modal.Footer>
    </Modal>
  );
};

export default RoleRegistPopup;
