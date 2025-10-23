import React from 'react';
import axios from 'axios';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs'; // (수정) 실제 경로에 맞게 수정 필요

import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';

const ProgressBarRenderer = (props: ICellRendererParams<any, number>) => {
  const value = props.value ?? 0;
  const valueAsPercent = value + '%';
  const progressBarStyle = {
    width: valueAsPercent,
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: '4px',
    transition: 'width 0.5s ease-in-out',
  };
  const wrapperStyle = {
    width: '100%',
    height: '70%',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    backgroundColor: '#e9ecef',
  };

  return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 5px' }}>
        <div style={wrapperStyle}>
          <div style={progressBarStyle} />
        </div>
        <span style={{ marginLeft: '8px' }}>{valueAsPercent}</span>
      </div>
  );
};



const formatDateForServer = (date: Date | string): string | null => {
  if (!date) return null; // null, undefined, 빈 문자열 등은 null로 처리

  let dateObj: Date;

  if (typeof date === 'string') {
    // "2025-10-21" 또는 "2025-10-21T..." 형식의 문자열을 Date 객체로 변환
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date; // 이미 Date 객체인 경우
  } else {
    console.warn("알 수 없는 날짜 형식:", date);
    return null; // 처리할 수 없는 타입
  }

  // 유효한 Date 객체인지 확인 (예: "Invalid Date")
  if (isNaN(dateObj.getTime())) {
    console.warn("유효하지 않은 날짜 값:", date);
    return null;
  }

  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');

  // LocalDate에 맞게 YYYY-MM-DD 형식으로 반환
  return `${yyyy}-${mm}-${dd}`;
};


const convertDatesInRow = (row: any) => {
  const newRow = { ...row }; // 원본 수정을 피하기 위해 복사

  // startDate와 endDate가 존재하면 서버 형식으로 변환
  if (newRow.startDate) {
    newRow.startDate = formatDateForServer(newRow.startDate);
  }
  if (newRow.endDate) {
    newRow.endDate = formatDateForServer(newRow.endDate);
  }

  return newRow;
};


/**
 * 프로젝트 관리 페이지 컴포넌트
 */
const ProjectList: React.FC = () => {
  const gridRef = React.useRef<AgGridWrapperHandle>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchProjects = React.useCallback(async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/project/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {

        const aData = response.data.map((row: any) => ({
          ...row,
          gridRowId: row.projectId || row.projectCode, // projectId나 projectCode를 고유 ID로 사용

          // agDateCellEditor가 Date 객체를 사용하도록 하기 위함
          startDate: row.startDate ? new Date(row.startDate) : null,
          endDate: row.endDate ? new Date(row.endDate) : null,

        }))
        gridRef.current?.setRowData(aData);
      }
    } catch (error) {
      console.error("프로젝트 목록을 불러오는 데 실패했습니다.", error);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSave = React.useCallback(async (lists: {
    deleteList: any[];
    updateList: any[];
    createList: any[];
  }) => {
    console.log("저장할 데이터 (변환 전):", lists);

    if (lists.createList.length === 0 && lists.updateList.length === 0 && lists.deleteList.length === 0) {
      alert('저장할 변경 내용이 없습니다.');
      return;
    }

    const payload = {
      // deleteList는 보통 id만 사용하므로 변환이 필요 없을 수 있습니다.
      deleteList: lists.deleteList,
      updateList: lists.updateList.map(convertDatesInRow), // 날짜 변환 적용
      createList: lists.createList.map(convertDatesInRow)  // 날짜 변환 적용
    };

    console.log("서버로 보낼 데이터 (변환 후):", payload);

    try {
      const token = sessionStorage.getItem('authToken');

      await axios.post('http://localhost:8080/project/save', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('성공적으로 저장되었습니다.');
      fetchProjects();
    } catch (error) {
      console.error("데이터 저장에 실패했습니다.", error);
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
  }, [fetchProjects]);


  //강제로 행을 다시 그리도록(redraw)
  const handleGridReady = React.useCallback(() => {
    setTimeout(() => {
      const gridApi = gridRef.current?.gridApi;
      if (gridApi) {

        gridApi.sizeColumnsToFit();

        gridApi.redrawRows();
      }
    }, 0); // 레이아웃이 안정화될 시간을 벌기 위해 setTimeout은 유지
  }, []);

  const handleSelectTab = React.useCallback(
      (tab: { key: string; label: string; path: string }) => {
        console.log('--- handleSelectTab ---', tab);
        const rootTabsData = sessionStorage.getItem('persist:rootTabs');
        console.log('persist:rootTabs data:', rootTabsData);

        if (rootTabsData) {
          try {
            const parsedData = JSON.parse(rootTabsData);

            const cachedTabs = JSON.parse(parsedData.tabs);
            console.log('Cached tabs:', cachedTabs);

            if (cachedTabs.length >= 8) { // (수정) 8개 '이상'일 경우
              alert('최대 8개의 탭만 열 수 있습니다.');
              return;
            } else {
              console.log('Dispatching addTab and setActiveTab...');
              dispatch(addTab(tab));
              dispatch(setActiveTab(tab.key));
              console.log('Navigating to:', tab.path);
              navigate(tab.path);
            }
          } catch (e) {
            console.error("persist:rootTabs 파싱 실패:", e, rootTabsData);
            dispatch(addTab(tab));
            dispatch(setActiveTab(tab.key));
            navigate(tab.path);
          }
        } else {
          console.log('No rootTabsData, proceeding with navigation...');
          dispatch(addTab(tab));
          dispatch(setActiveTab(tab.key));
          navigate(tab.path);
        }
      },
      [dispatch, navigate] // <--- 🚨🚨 여기가 [dispatch, navigate] 인지 꼭 확인하세요!
  );


  const handleRowClick = React.useCallback((event: any) => {
    const projectData = event.data;


    if (!projectData || !projectData.projectId) {
      console.error('ERROR: projectData or projectId is missing!', projectData);
      return;
    }

    handleSelectTab({

      key: `project-detail-${projectData.projectId}`,
      label: `Project Detail : ${projectData.projectName || projectData.projectCode}`,

      path: `/main/project/detail/${projectData.projectId}`,
    });
  }, [handleSelectTab]);


  const [columnDefs] = React.useState<ColDef[]>([
    {
      headerName: '프로젝트 코드',
      field: 'projectCode',
      editable: (params) => params.data.isCreated === true,
      width: 170
    },
    {
      headerName: '프로젝트명',
      field: 'projectName',
      editable: true,
      width: 250
    },
    {
      headerName: '진행 단계',
      field: 'step',
      editable: true,
      width: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['IN PLANNING', 'PREPARING', 'IN PROGRESS', 'WAITING FOR ACCEPTANCE', 'CLOSED']
      }
    },
    {
      headerName: '시작일',
      field: 'startDate',
      editable: true,
      cellEditor: 'agDateCellEditor',
      width: 120
    },
    {
      headerName: '종료일',
      field: 'endDate',
      editable: true,
      cellEditor: 'agDateCellEditor',
      width: 120
    },
    {
      headerName: '전체 진행률',
      field: 'overallProgress',
      width: 200,
      cellRenderer: ProgressBarRenderer,
      editable: false
    },
    {
      headerName: '프로젝트 상태',
      field: 'projectStatus',
      editable: true,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['WAITING', 'ON-TIME', 'SERIOUS', 'CLOSED']
      }
    },
    {
      headerName: '담당 PM ID',
      field: 'pmId',
      editable: true,
      width: 120
    },
    {
      headerName: '상세 설명',
      field: 'description',
      editable: true,
      cellEditor: 'agLargeTextCellEditor',
      width: 300
    },
  ]);


  return (
      <Container fluid className="h-100 container_bg">
        <Row className="container_title">
          <Col>
            <h2>프로젝트 관리</h2>
          </Col>
        </Row>
        <Row className="container_contents">
          <Row className="search_wrap">
            <Col className="search_btn">
              {/* 필요시 여기에 검색 버튼 등을 추가할 수 있습니다. */}
            </Col>
          </Row>
          <Row className="contents_wrap">
            <Col>
              <AgGridWrapper
                  ref={gridRef}
                  columnDefs={columnDefs}
                  canCreate={true}
                  canUpdate={true}
                  canDelete={true}
                  onSave={handleSave}
                  rowSelection="multiple"
                  enableCheckbox={true}
                  onGridLoaded={handleGridReady}
                  onRowClicked={handleRowClick}
              />
            </Col>
          </Row>
        </Row>
      </Container>
  );
};

export default ProjectList;