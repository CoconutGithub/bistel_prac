import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./ExpenseManagement.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import FileCellRenderer from "~components/fileCellRenderer/FileCellRenderer";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import { useEffect, useRef, useState } from "react";

const ExpenseManagement: React.FC = () => {
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const [selectedFilesMap, setSelectedFilesMap] = useState<any>({});

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

  const handleSave = (props: any) => {
    const { deleteList, updateList, createList } = props;
    console.log(deleteList, updateList, createList);
  };

  const columns = [
    {
      filed: "gridRowId",
      field: "user",
      headerName: "User",
      editable: true,
      autoHeight: true,
      flex: 1,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      filed: "gridRowId",
      field: "category",
      headerName: "Category",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      filed: "gridRowId",
      field: "item",
      headerName: "Item",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      filed: "gridRowId",
      field: "price",
      headerName: "Price",
      editable: true,
      autoHeight: true,
      flex: 1,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      filed: "gridRowId",
      field: "fileAttachment",
      headerName: "File Attachment",
      cellRenderer: (params: any) => (
        <FileCellRenderer
          {...params}
          rowId={params.data.gridRowId}
          selectedFilesMap={selectedFilesMap}
          setSelectedFilesMap={setSelectedFilesMap}
        />
      ),
      editable: false,
      autoHeight: true,
      flex: 3,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
  ];

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
          onSave={handleSave}
        />
      </main>
    </div>
  );
};

export default ExpenseManagement;
