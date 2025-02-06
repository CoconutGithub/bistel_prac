import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./ExpenseManagement.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import FileCellRenderer from "~components/fileCellRenderer/FileCellRenderer";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import { useEffect, useRef, useState } from "react";

async function getPresignedUrl(file: File) {
  const response = await fetch(
    "http://localhost:8080/api/minio/presigned-url?fileName=" +
      encodeURIComponent(file.name),
    {
      method: "POST",
    }
  );

  const { presignedUrl, fileUrl } = await response.json();
  return { presignedUrl, fileUrl };
}

// async function uploadFile(file: File) {
//   const { presignedUrl, fileUrl } = await getPresignedUrl(file);

//   await fetch(presignedUrl, {
//     method: 'PUT',
//     body: file,
//     headers: {
//       'Content-Type': file.type
//     }
//   });

//   console.log('업로드 완료! 파일 URL:', fileUrl);
// }

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

    const createData = Object.entries(createList).map(
      ([key, value]: [any, any]) => {
        return {
          gridRowId: value.gridRowId,
          user: value.user,
          category: value.category,
          item: value.item,
          price: value.price,
          fileAttachment: selectedFilesMap[value.gridRowId] || null,
        };
      }
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
