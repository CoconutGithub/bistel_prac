import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useContext,
} from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { ColDef, CellClassParams } from "@ag-grid-community/core";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "~styles/components/grid.scss";
import { ComAPIContext } from "~components/ComAPIContext";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import ComButton from "~pages/portal/buttons/ComButton";
import cn from "classnames";
import "./AgGridWrapper.scss";
import styles from "./AgGridWrapper.module.scss";

//##################### type 지정-start #######################
// Props 타입 정의
interface AgGridWrapperProps {
  children?: React.ReactNode;

  showButtonArea?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
  canUpdate?: boolean;
  columnDefs: ColDef[];
  enableCheckbox?: boolean;
  rowNumberColumn?: boolean;
  rowSelection?: "multiple" | "single"; // 타입 제한 적용
  rowHeight?: number;
  pagination?: boolean;
  paginationPageSize?: number;
  tableHeight?: any;

  onDelete?: (selectedRows: any[]) => void;
  onSave?: (lists: {
    deleteList: any[];
    updateList: any[];
    createList: any[];
  }) => void;
  onCellEditingStopped?: (event: any) => void;
  onCellValueChanged?: (event: any) => void;
  onCellEditingStarted?: (event: any) => void;
}

//##################### type 지정-end #######################

// 수정된 행에 스타일을 적용하는 규칙
const rowClassRules = {
  "ag-row-deleted": (params: any) => params.data?.isDeleted === true, // isDeleted가 true인 경우
  "ag-row-updated": (params: any) => params.data?.isUpdated === true, // isUpdated가 true인 경우
};

const defaultSettings = {
  children: null,
  showButtonArea: true,
  canCreate: false,
  canDelete: false,
  canUpdate: false,
  columnDefs: [],
  enableCheckbox: false,
  rowSelection: "multiple" as "multiple",
  rowHeight: 40,
  pagination: true,
  paginationPageSize: 10,
  tableHeight: "600px",

  onDelete: () => {},
  onSave: () => {},
  onCellEditingStopped: () => {},
  onCellValueChanged: () => {},
  onCellEditingStarted: () => {},
};

const AgGridWrapper = forwardRef<AgGridWrapperHandle, AgGridWrapperProps>(
  (props, ref) => {
    const settings = { ...defaultSettings, ...props };
    const {
      children,
      showButtonArea,
      canCreate,
      canDelete,
      canUpdate,
      columnDefs,
      enableCheckbox,
      rowHeight,
      rowSelection,
      pagination,
      paginationPageSize,
      tableHeight,

      onDelete,
      onSave,
      onCellEditingStopped,
      onCellValueChanged,
      onCellEditingStarted,
    } = settings;

    console.log("======create AgGridWrapper======");
    const comAPIContext = useContext(ComAPIContext);
    const gridRef = useRef<AgGridReact>(null); // AgGrid 참조
    const [rowData, setRowData] = useState<any[]>([]);
    const [modifiedRows, setModifiedRows] = useState(new Set()); // 수정된 행 추적
    const [selectedFilesMap, setSelectedFilesMap] = useState<any>({});

    const updateList = useRef<Map<string, string>>(new Map());
    const createList = useRef<Map<string, string>>(new Map());
    const deleteList = useRef<Map<string, string>>(new Map());

    // 기본 컬럼 정의
    const defaultColDef: ColDef = {
      resizable: true,
      sortable: true,
      filter: true,
    };

    // 컬럼 정의 생성
    const getColumnDefs = (): ColDef[] => {
      let baseColumnDefs = enableCheckbox
        ? [
            {
              headerCheckboxSelection: true,
              checkboxSelection: true,
              width: 50,
              cellStyle: { display: "flex", alignItems: "center" },
            },
            ...columnDefs,
          ]
        : columnDefs;

      // 행 번호 컬럼 추가
      baseColumnDefs.unshift({
        headerName: "No",
        valueGetter: "node.rowIndex + 1",
        width: 90,
        suppressSizeToFit: true,
        cellStyle: { display: "flex", alignItems: "center" },
      });

      return baseColumnDefs.map((colDef) => ({
        ...colDef,
        cellClass: (params: CellClassParams) => {
          return "ag-row-default";
        },
      }));
    };

    const onGridReady = useCallback(() => {
      //console.log('Grid is ready');
    }, []);

    const handleCellValueChange = (event: any) => {
      const { data } = event; // 변경된 행 데이터 가져오기
      if (data.isCreated == true) {
        createList.current.set(data.gridRowId, data); // 고유 ID를 키로 사용
        console.log("createList:", createList.current);
      } else {
        data.isUpdated = true; // isUpdated 플래그 설정
        updateList.current.set(data.gridRowId || data.id, data); // 고유 ID를 키로 사용
        console.log("updateList:", updateList.current);
      }

      // 변경된 행만 업데이트
      gridRef.current?.api.applyTransaction({ update: [data] });

      // 외부에서 전달받은 이벤트 핸들러 호출
      if (onCellValueChanged) {
        onCellValueChanged(event); // 외부에서 전달된 핸들러 호출
      }
    };

    const handleCellEditingStopped = (event: any) => {
      // 외부에서 전달받은 이벤트 핸들러 호출
      if (onCellEditingStopped) {
        onCellEditingStopped(event); // 외부에서 전달된 핸들러 호출
      }
    };

    const handleCellEditingStarted = (event: any) => {
      if (onCellEditingStarted) {
        onCellEditingStarted(event);
      }
    };

    const handleDelete = () => {
      const selectedNodes = gridRef.current?.api.getSelectedNodes();
      console.log("selectedNodes:", selectedNodes);
      if ((selectedNodes?.length ?? 0) === 0) {
        comAPIContext.showToast(
          "삭제상태로 변경할 내용이 선택이 되지 않았습니다.",
          "dark"
        );
      }

      const selectedRows = selectedNodes
        ? selectedNodes.map((node) => node.data)
        : [];

      // 선택된 행에 isDeleted 플래그 추가
      selectedRows.forEach((row, index) => {
        if (row.add === "add") {
          gridRef.current?.api.applyTransaction({ remove: [row] })!;
          selectedRows.splice(index, 1);
        } else {
          row.isDeleted = true; // 플래그 설정
          deleteList.current.set(row.gridRowId || row.id, row); // 고유 ID를 키로 사용
        }
      });

      console.log("deleteList:", deleteList.current);

      // 선택된 행만 업데이트
      gridRef.current?.api.applyTransaction({ update: selectedRows });
    };

    const handleSave = () => {
      if (onSave) {
        const finalUpdateList = Array.from(updateList.current.values());
        const finalCreateList = Array.from(createList.current.values());
        const finalDeleteList = Array.from(deleteList.current.values());
        onSave({
          deleteList: finalDeleteList,
          updateList: finalUpdateList,
          createList: finalCreateList,
        });
      }
    };

    const handleAddRow = () => {
      const newRow = {
        isCreated: true,
        gridRowId: new Date().getTime() + Math.random().toString(36),
        add: "add",
      }; // 신규 행 데이터
      const gridApi = gridRef.current?.api;

      if (gridApi) {
        gridApi.applyTransaction({
          add: [newRow], // 추가할 행
          addIndex: 0, // 맨 상단에 삽입
        });

        // 상태도 업데이트 (선택 사항)
        // setRowData((prev) => [newRow, ...prev]);
      }
    };

    // useImperativeHandle로 외부에서 접근 가능한 메서드 정의
    useImperativeHandle(ref, () => ({
      setRowData: (newData: any[]) => {
        setRowData(newData); // 데이터 설정
        gridRef.current?.api.deselectAll();
        updateList.current.clear();
        createList.current.clear();
        deleteList.current.clear();
      },
      getRowData: () => {
        return rowData; // 현재 데이터 반환
      },
    }));

    return (
      <div className={cn(styles.start)}>
        <Container fluid className={styles.container}>
          <Row className={styles.tableInfo}>
            <Col className={styles.countColumn}>
              <p className={styles.count}>({rowData.length})</p>
            </Col>
            {showButtonArea && (
              <Col className={styles.buttonColumn}>
                {children}
                <ComButton
                  size="sm"
                  disabled={!canDelete}
                  variant="outline-danger"
                  onClick={handleDelete}
                >
                  삭제
                </ComButton>
                <ComButton
                  size="sm"
                  disabled={!canCreate}
                  variant="outline-primary"
                  onClick={handleAddRow}
                >
                  추가
                </ComButton>
                <ComButton
                  size="sm"
                  disabled={!canUpdate}
                  variant="primary"
                  onClick={handleSave}
                >
                  저장
                </ComButton>
              </Col>
            )}
          </Row>
          <Row
            className={styles.tableArea}
            style={{ height: tableHeight || "600px" }}
          >
            <AgGridReact
              ref={gridRef}
              rowSelection={rowSelection}
              rowHeight={rowHeight}
              rowData={rowData}
              pagination={pagination}
              paginationPageSize={paginationPageSize} // 한 페이지에 표시할 행 개수
              columnDefs={getColumnDefs()}
              defaultColDef={defaultColDef}
              modules={[ClientSideRowModelModule]}
              onCellValueChanged={handleCellValueChange}
              rowClassRules={rowClassRules} // 행 스타일 규칙 적용
              getRowId={(params) => String(params.data.gridRowId || "id")} // GRID 에서 행별로 유일한 고유 ID 설정
              onGridReady={onGridReady}
              onCellEditingStopped={handleCellEditingStopped}
              onCellEditingStarted={handleCellEditingStarted}
              className={cn(
                "ag-theme-alpine",
                "siportal-theme-grid",
                styles.grid
              )}
            />
          </Row>
        </Container>
      </div>
    );
  }
);

export default React.memo(AgGridWrapper);
