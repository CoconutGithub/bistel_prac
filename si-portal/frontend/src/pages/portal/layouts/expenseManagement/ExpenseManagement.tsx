import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./ExpenseManagement.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import FileCellRenderer from "~components/FileCellRenderer";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import { useEffect, useRef } from "react";

const columns = [
  {
    filed: "gridRowId",
    field: "user",
    headerName: "User",
    editable: true,
    flex: 1,
  },
  {
    filed: "gridRowId",
    field: "category",
    headerName: "Category",
    editable: true,
    flex: 2,
  },
  {
    filed: "gridRowId",
    field: "item",
    headerName: "Item",
    editable: true,
    flex: 2,
  },
  {
    filed: "gridRowId",
    field: "price",
    headerName: "Price",
    editable: true,
    flex: 2,
  },
  {
    filed: "gridRowId",
    field: "fileAttachment",
    headerName: "File Attachment",
    cellRenderer: FileCellRenderer,
    editable: false,
    flex: 2,
  },
];

const ExpenseManagement: React.FC = () => {
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const searchGrid = () => {
    gridRef.current!.setRowData([
      {
        gridRowId: "1",
        user: "김민수",
        category: "사무용품",
        item: "가위",
        price: "10,000원",
      },
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
        <p className={styles.title}>Expense Management</p>
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

export default ExpenseManagement;
