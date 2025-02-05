import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./ExpenseManagement.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import FileCellRenderer from "~components/fileCellRenderer/FileCellRenderer";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import { useRef, useState } from "react";

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

    // 신규 생성 데이터를 처리하는 로직
    const createData = await Promise.all(
      Object.entries(createList).map(async ([key, value]: [any, any]) => {
        let fileDate = null;

        if (selectedFilesMap[value.gridRowId]) {
          const files = selectedFilesMap[value.gridRowId];
          // 이어서 작성
        }

        return {
          gridRowId: value.gridRowId,
          user: value.user,
          category: value.category,
          item: value.item,
          price: value.price,
          fileAttachment: selectedFilesMap[value.gridRowId] || null,
        };
      })
    );
    console.log("createData", createData);
  };

  const columns = [
    {
      filed: "gridRowId",
      field: "user",
      headerName: "User",
      editable: true,
      flex: 1,
      autoHeight: true,
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
      cellRenderer: (params: any) => {
        return (
          <FileCellRenderer
            {...params}
            rowId={params.data?.gridRowId}
            selectedFilesMap={selectedFilesMap}
            setSelectedFilesMap={setSelectedFilesMap}
          />
        );
      },
      editable: false,
      autoHeight: true,
      flex: 3,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
  ];

  // useEffect(() => {
  //   const findGridInterval = setInterval(() => {
  //     if (gridRef.current) {
  //       searchGrid();
  //       clearInterval(findGridInterval);
  //     }
  //   }, 100);

  //   return () => clearInterval(findGridInterval);
  // }, []);

  console.log("selectedFilesMap", selectedFilesMap);

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
