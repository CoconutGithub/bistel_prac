import React, {
    useState,
    useContext,
    useRef,
    useCallback,
    useEffect,
    useMemo,
  } from "react";
  import { Button, Col, Container, Form, Row } from "react-bootstrap";
  import { ComAPIContext } from "~components/ComAPIContext";
  import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
  import axios from "axios";
  import { useSelector } from "react-redux";
  import { RootState } from "~store/Store";
  import YwkResumePopup from "~pages/biz/YwkResumePopup";
  import YwkResumeRegist from "~pages/biz/YwkResumeRegist";
  import { AgGridWrapperHandle } from "~types/GlobalTypes"; // 팝업 컴포넌트 가져오기
  import ComButton from "~pages/portal/buttons/ComButton";
  import { cachedAuthToken } from "~store/AuthSlice";
  
  const columnDefs = [
    {
        field: "gridRowId",
        headerName: "gridRowId",
        sortable: true,
        filter: true,
        editable: false,
        width: 150,
        hide: true,
    },
    {
      field: "id",
      headerName: "ID",
      sortable: true,
      filter: true,
      editable: false,
      width: 100,
    },
    {
      field: "fullName",
      headerName: "이름",
      sortable: true,
      filter: true,
      editable: false,
      width: 150,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: [] },
    },
    {
      field: "email",
      headerName: "이메일",
      sortable: true,
      filter: true,
      editable: false,
      width: 100,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: { values: [] },
    },
    {
        field: "phone",
        headerName: "전화번호",
        sortable: true,
        filter: true,
        editable: false,
        width: 150,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [] },
    },
    {
        field: "summary",
        headerName: "요약",
        sortable: true,
        filter: true,
        editable: false,
        width: 150,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [] },
    },
    {
        field: "experience",
        headerName: "경험",
        sortable: true,
        filter: true,
        editable: false,
        width: 150,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [] },
    },
    {
        field: "education",
        headerName: "교육",
        sortable: true,
        filter: true,
        editable: false,
        width: 150,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [] },
    },
    {
        field: "skills",
        headerName: "스킬",
        sortable: true,
        filter: true,
        editable: false,
        width: 150,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [] },
    },
    {
        field: "resumeFilename",
        headerName: "첨부파일",
        sortable: true,
        filter: true,
        editable: false,
        width: 150,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: { values: [] },
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
      headerName: "수정일",
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
  
  interface Role {
    roleId: number | null;
    roleName: string;
    status: string;
  }
  
  interface SaveRolesPayload {
    updateList: Role[];
    deleteList: number[];
  }
  
  interface SaveRolesResponse {
    messageCode: string;
    message: string;
    updatedUsersCnt: number;
    insertedUsersCnt: number;
    deletedUsersCnt: number;
  }
  
  // let roleKind : any = null;
  
  const YwkResume: React.FC = () => {
    const comAPIContext = useContext(ComAPIContext);
    const gridRef = useRef<AgGridWrapperHandle>(null);

    const [dynamicColumnDefs, setDynamicColumnDefs] = useState(columnDefs); // 컬럼 정보
    const [showPopup, setShowPopup] = useState(false);
    const [showReigst, setRegist] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");
    const [selectedResume, setSelectedResume] = useState<any>(null);

    console.log("ManageRole create.......");
  
    useEffect(() => {
      const setDefColumn = () => {
        columnDefs.forEach((column) => {
          if (column.headerName === "이름") {
            column.headerName = comAPIContext.$msg("label", "name", "이름");
          } else if (column.headerName === "상태") {
            column.headerName = comAPIContext.$msg("label", "status", "상태");
          } else if (column.headerName === "생성일") {
            column.headerName = comAPIContext.$msg(
              "label",
              "create_date",
              "생성일"
            );
          } else if (column.headerName === "생성자") {
            column.headerName = comAPIContext.$msg("label", "creator", "생성자");
          } else if (column.headerName === "수정일") {
            column.headerName = comAPIContext.$msg(
              "label",
              "update_date",
              "수정일"
            );
          } else if (column.headerName === "수정자") {
            column.headerName = comAPIContext.$msg("label", "editor", "수정자");
          }
        });
      };
  
      setDefColumn();
  
    }, []);

    const handleSearch = async () => {
      comAPIContext.showProgressBar();
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-ywk-resume`,
          {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
          }
        );

        console.log(response)
  
        if (gridRef.current) {
          gridRef.current.setRowData(response.data);
        }
  
        comAPIContext.showToast(
          comAPIContext.$msg(
            "message",
            "search_complete",
            "조회가 완료됐습니다."
          ),
          "success"
        );
      } catch (error: any) {
        console.error("Error fetching roles:", error);
        comAPIContext.showToast(
          comAPIContext.$msg("message", "search_fail", "검색을 실패했습니다."),
          "danger"
        );
      } finally {
        comAPIContext.hideProgressBar();
      }
    };
  
    const handleRegist = useCallback(() => {
        setRegist(true);
        console.log('regist')
    }, []);

    const registButton = useMemo(
        () => (
            <>
              <ComButton
                size="sm"
                className="me-2"
                variant="primary"
                onClick={handleRegist}
              >
                {comAPIContext.$msg("label", "regist", "등록")}
              </ComButton>
            </>
        ),
        []
    );
  
    const searchButton = useMemo(
      () => (
        <>
          <ComButton
            size="sm"
            className="me-2"
            variant="primary"
            onClick={handleSearch}
          >
            {comAPIContext.$msg("label", "search", "검색")}
          </ComButton>
        </>
      ),
      []
    );

    const onCellDoubleClicked = (e:any) => {
        console.log(e)
        setSelectedResume(e.data);
        setShowPopup(true);
    }
  
    const handleClosePopup = () => {
      setShowPopup(false);
    };

    const handleCloseRegist = () => {
        setRegist(false);
    };
    return (
    <Container fluid className="container_bg h-100">
        <Row className="container_title">
            <Col>
                <h2>{comAPIContext.$msg("menu", "resume_role", "이력서 관리")}</h2>
            </Col>
        </Row>
        <Row className="container_contents">
            <Col>
                <AgGridWrapper
                ref={gridRef} // forwardRef를 통해 연결된 ref
                showButtonArea={true}
                canCreate={false}
                canDelete={false}
                canUpdate={false}
                columnDefs={dynamicColumnDefs}
                enableCheckbox={false}
                onCellDoubleClicked={onCellDoubleClicked}
                >
                {registButton}
                {searchButton}
                </AgGridWrapper>
            </Col>
        </Row>
        <YwkResumePopup
            show={showPopup}
            onClose={handleClosePopup}
            resumeData={selectedResume}
        />
        <YwkResumeRegist
            show={showReigst}
            onClose={handleCloseRegist}
        />
    </Container>
    );
  };
  
  export default YwkResume;