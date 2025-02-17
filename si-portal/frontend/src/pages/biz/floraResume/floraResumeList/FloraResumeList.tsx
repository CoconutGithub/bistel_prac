import { useRef } from "react";
import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./FloraResumeList.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import { AgGridWrapperHandle } from "@/types/GlobalTypes";

const FloraResumeList = () => {
  const gridRef = useRef<AgGridWrapperHandle>(null);

  const columns = [
    {
      field: "userName",
      headerName: "User Name",
      editable: false,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "company",
      headerName: "Company",
      editable: false,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "department",
      headerName: "Department",
      editable: false,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      editable: false,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "position",
      headerName: "Position",
      editable: false,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
  ];

  return (
    <div className={styles.start}>
      <header className={styles.header}>
        <SiTableIcon width={12} height={12} fillColor="#00000073" />
        <p className={styles.title}>Flora Resume</p>
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

export default FloraResumeList;
