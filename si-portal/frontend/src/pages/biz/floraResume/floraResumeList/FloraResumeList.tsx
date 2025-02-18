import { useCallback, useEffect, useRef, useState } from "react";
import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./FloraResumeList.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import axios from "axios";
import { cachedAuthToken } from "~store/AuthSlice";
import ComButton from "~pages/portal/buttons/ComButton";
import SiNewIcon from "~components/icons/SiNewIcon";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addTab, setActiveTab } from "~store/RootTabs";

const fetchResumes = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_IP}/biz/flora-resumes`,
      {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch resumes", error);
    return [];
  }
};

const FloraResumeList = () => {
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const columns = [
    {
      field: "fullName",
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
      field: "position",
      headerName: "Position",
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
  ];

  const handleSelectTab = useCallback(
    (tab: { key: string; label: string; path: string }) => {
      const rootTabsData = sessionStorage.getItem("persist:rootTabs");
      if (rootTabsData) {
        const parsedData = JSON.parse(rootTabsData);
        const cachedTabs = JSON.parse(parsedData.tabs);

        if (cachedTabs.length === 8) {
          alert("최대 8개의 탭만 열 수 있습니다.");
          return;
        } else {
          dispatch(addTab(tab));
          dispatch(setActiveTab(tab.key));
          navigate(tab.path);
        }
      }
    },
    []
  );

  useEffect(() => {
    const loadResumes = async () => {
      const raw = await fetchResumes();
      if (gridRef.current) {
        const data = raw.map((row: any, index: any) => ({
          gridRowId: row.id,
          ...row,
        }));
        gridRef.current.setRowData(data);
      }
    };
    loadResumes();
  }, []);

  return (
    <div className={styles.start}>
      <header className={styles.header}>
        <div className={styles.title_area}>
          <SiTableIcon width={12} height={12} fillColor="#00000073" />
          <p className={styles.title}>Resume List</p>
        </div>
        <ComButton
          onClick={() =>
            handleSelectTab({
              key: "create-flora-resume",
              label: "Create resume",
              path: "/main/flora-resume/create",
            })
          }
          size="sm"
          className={styles.button}
        >
          <SiNewIcon width={14} height={14} currentFill={true} />
          New
        </ComButton>
      </header>
      <main className={styles.main}>
        <AgGridWrapper
          ref={gridRef}
          enableCheckbox={false}
          showButtonArea={false}
          canCreate={false}
          canDelete={false}
          canUpdate={false}
          columnDefs={columns}
          tableHeight={"calc(100% - 35px)"}
          useNoColumn={true}
        />
      </main>
    </div>
  );
};

export default FloraResumeList;
