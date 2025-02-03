import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./RecordEdit.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import FileCellRenderer from "~components/FileCellRenderer";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import { useEffect, useRef } from "react";

const columns = [
  {
    filed: "gridRowId",
    field: "h1",
    headerName: "Header1",
    editable: true,
    flex: 1,
  },
  {
    filed: "gridRowId",
    field: "h2",
    headerName: "Headeer2",
    editable: true,
    flex: 1,
  },
  {
    filed: "gridRowId",
    field: "attachFile",
    headerName: "File",
    cellRenderer: FileCellRenderer,
    editable: false,
    flex: 2,
  },
];

const RecordEdit: React.FC = () => {
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const searchGrid = () => {
    gridRef.current!.setRowData([
      { gridRowId: "1", h1: "aaa", h2: "bbb" },
      { gridRowId: "2", h1: "aaa", h2: "bbb" },
      { gridRowId: "3", h1: "aaa", h2: "bbb" },
    ]);
  };

  useEffect(() => {
    const findGridInterval = setInterval(() => {
      if (gridRef.current) {
        searchGrid();
        clearInterval(findGridInterval);
      }
    }, 100);

    return () => clearInterval(findGridInterval);
  }, []);

  return (
    <div className={styles.start}>
      <header className={styles.header}>
        <SiTableIcon width={12} height={12} fillColor="#00000073" />
        <p className={styles.title}>Record Edit</p>
      </header>
      <main className={styles.main}>
        <AgGridWrapper
          ref={gridRef}
          enableCheckbox={true}
          showButtonArea={true}
          canCreate={true}
          canDelete={true}
          canUpdate={true}
          columnDefs={columns}
          tableHeight={"calc(100% - 35px)"}
        />
      </main>
    </div>
  );
};

export default RecordEdit;
