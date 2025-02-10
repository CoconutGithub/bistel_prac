import React, { useEffect, useContext, useRef } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import { useSelector } from "react-redux";
import { ComAPIContext } from "~components/ComAPIContext";
import axios from "axios";
import { RootState } from "~store/Store";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import ComButton from "~pages/portal/buttons/ComButton";
import { cachedAuthToken } from "~store/AuthSlice";

// 컬럼 정의
const columnDefs = [
  { field: "gridRowId", headerName: "gridRowId", editable: false, hide: true },
  {
    field: "jobName",
    headerName: "Job Name",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "groupName",
    headerName: "Group",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "triggerKey",
    headerName: "Trigger Key",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "className",
    headerName: "Class Name",
    sortable: true,
    filter: true,
    editable: true,
    width: 400,
  },
  {
    field: "cronTab",
    headerName: "Cron Exp",
    sortable: true,
    filter: true,
    editable: true,
    width: 150,
  },
  {
    field: "status",
    headerName: "USE",
    sortable: true,
    filter: true,
    editable: true,
    width: 100,
    cellEditor: "agSelectCellEditor", // Combobox 설정
    cellEditorParams: { values: ["ACTIVE", "INACTIVE"] }, // Combobox 옵션
  },
  {
    field: "createDate",
    headerName: "Create Date",
    sortable: true,
    filter: true,
  },
];

const ManageSchedule: React.FC = () => {
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
  console.log("stat", state);

  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridWrapperHandle>(null);
  let scheduleData = useRef<any[]>([]);

  useEffect(() => {}, []);

  const handleSearch = async () => {
    comAPIContext.showProgressBar();
    await new Promise((resolve) => setTimeout(resolve, 500));

    axios
      .get("http://localhost:8080/admin/api/get-schedule", {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
        params: { jobName: inputRef.current?.value || "", status: "" },
      })
      .then((res) => {
        console.log("res", res);
        console.log("gridRef.current", gridRef.current);
        if (gridRef.current) {
          gridRef.current.setRowData(res.data); // 데이터를 AgGridWrapper에 설정
          scheduleData.current = JSON.parse(JSON.stringify(res.data));
          //             console.log('scheduleData.current:', scheduleData.current);
        }
        comAPIContext.hideProgressBar();
        comAPIContext.showToast(comAPIContext.$msg("message", "search_complete", "조회가 완료됐습니다."), "success");
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
      comAPIContext.showToast(comAPIContext.$msg("message", "no_save_data", "저장할 데이터가 없습니다."), "dark");
      return;
    }

    try {
      comAPIContext.showProgressBar();
      console.log("1.update 행들:", lists.updateList);
      console.log("2.delete 행들:", lists.deleteList);
      console.log("3.create 행들:", lists.createList);

      let realUpdateList = [];
      if (lists.updateList?.length > 0) {
        for (const obj of lists.updateList) {
          if (
            obj.cronTab === undefined ||
            obj.cronTab === null ||
            typeof obj.cronTab !== "string" ||
            obj.cronTab.trim().length == 0 ||
            obj.status === undefined ||
            obj.status === null ||
            typeof obj.status !== "string" ||
            obj.status.trim().length == 0
          ) {
            comAPIContext.showToast(
              "Cron Exp 또는 USE를 입력해주세요.",
              "dark"
            );
            return;
          }
          const temp: any = scheduleData.current.find(
            (e) =>
              e.jobName === obj.jobName &&
              e.groupName === obj.groupName &&
              e.triggerKey === obj.triggerKey &&
              e.className === obj.className
          );
          // console.log('temp:', temp);
          // console.log('temp?.cronTab:', temp?.cronTab);
          // console.log('obj.cronTab:', obj.cronTab);
          // console.log('temp?.status:', temp?.status);
          // console.log('obj.status:', obj.status);

          if (
            temp !== undefined &&
            (temp.cronTab !== obj.cronTab || temp.status !== obj.status)
          ) {
            if (temp.cronTab !== obj.cronTab) {
              obj.changeCron = "Y";
            } else {
              obj.changeCron = "N";
            }
            if (temp.status !== obj.status) {
              obj.changeStatus = "Y";
            } else {
              obj.changeStatus = "N";
            }
            realUpdateList.push(obj);
          } else {
            comAPIContext.showToast(
              "JobName(" + obj.jobName + ")은 변경된 데이터가 없습니다.",
              "dark"
            );
            return;
          }
        }
      }
      // lists.createList에 인자들이 모두 있는지 확인하고 하나라도 없는 경우 메시지를 띄워주고 return
      if (lists.createList?.length > 0) {
        for (const obj of lists.createList) {
          if (
            obj.jobName === undefined ||
            obj.jobName === null ||
            typeof obj.jobName !== "string" ||
            obj.jobName.trim().length == 0 ||
            obj.groupName === undefined ||
            obj.groupName === null ||
            typeof obj.groupName !== "string" ||
            obj.groupName.trim().length == 0 ||
            obj.triggerKey === undefined ||
            obj.triggerKey === null ||
            typeof obj.triggerKey !== "string" ||
            obj.triggerKey.trim().length == 0 ||
            obj.className === undefined ||
            obj.className === null ||
            typeof obj.className !== "string" ||
            obj.className.trim().length == 0 ||
            obj.cronTab === undefined ||
            obj.cronTab === null ||
            typeof obj.cronTab !== "string" ||
            obj.cronTab.trim().length == 0 ||
            obj.status === undefined ||
            obj.status === null ||
            typeof obj.status !== "string" ||
            obj.status.trim().length == 0
          ) {
            comAPIContext.showToast("모든 항목을 입력해주세요.", "dark");
            return;
          }
          if (scheduleData.current.some((e) => e.jobName === obj.jobName)) {
            comAPIContext.showToast(
              "JobName(" + obj.jobName + ")은 이미 존재하는 데이터입니다.",
              "dark"
            );
            return;
          }
          if (
            scheduleData.current.some((e) => e.triggerKey === obj.triggerKey)
          ) {
            comAPIContext.showToast(
              "TriggerKey(" +
                obj.triggerKey +
                ")은 이미 존재하는 데이터입니다.",
              "dark"
            );
            return;
          }
        }
      }
      // 전송 데이터 구성
      const payload = {
        updateList: realUpdateList,
        deleteList: lists.deleteList,
        createList: lists.createList,
        userId: state.user?.userId,
      };
      console.log("realUpdateList:", realUpdateList);

      const response = await axios.post(
        "http://localhost:8080/admin/api/update-schedule",
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
      comAPIContext.showToast(comAPIContext.$msg("message", "save_fail", "저장이 실패했습니다."), "danger");
      handleSearch();
    } finally {
      comAPIContext.hideProgressBar();
    }
  };

  // 셀 편집 시작 시 호출되는 이벤트
  const onCellEditingStopped = (event: any) => {
    setTimeout(() => {
      console.log("Cell editing stopped", event);
      const oldValue = event.oldValue;
      const newValue = event.newValue;
      const uneditableCell = [
        "jobName",
        "groupName",
        "triggerKey",
        "className",
      ];
      if (
        !event.data.isCreated &&
        uneditableCell.includes(event.colDef.field) &&
        oldValue !== undefined &&
        oldValue !== newValue
      ) {
        // 편집 취소하고 원래 값으로 되돌리기
        event.node.setDataValue(event.column, oldValue, false); //suppressEvent: true로 설정하는 방법을 사용하여 이벤트가 재발생하지 않도록 설정
        event.api.stopEditing(false); // 편집 취소
        comAPIContext.showToast("해당 컬럼은 변경할 수 없습니다.", "danger");
      }
    }, 0); // 타이밍을 조금 늦춰서 호출
  };

  const onCellEditingStarted = (event: any) => {};

  const onCellValueChanged = (event: any) => {
    console.log("Cell changed", event);
  };

  return (
    <Container fluid>
      <Row className="mb-3">
        <Col>
          <h2>{ comAPIContext.$msg("menu", "manage_schedule", "스케줄 관리") }</h2>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col lg={11}>
          <Form.Group as={Row}>
            <Form.Label column sm={1} className="text-center">
              JOB NAME
            </Form.Label>
            <Col sm={4}>
              <Form.Control ref={inputRef} type="text" placeholder="Job Name" />
            </Col>
          </Form.Group>
        </Col>
        <Col lg={1}>
          <ComButton size="sm" variant="primary" onClick={handleSearch}>
            { comAPIContext.$msg("label", "search", "검색") }
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
            onCellEditingStopped={onCellEditingStopped} // 셀편집마침 이벤트 핸들러 등록
            onCellEditingStarted={onCellEditingStarted} // 셀편집시작
            onCellValueChanged={onCellValueChanged} // 셀변경
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ManageSchedule;
