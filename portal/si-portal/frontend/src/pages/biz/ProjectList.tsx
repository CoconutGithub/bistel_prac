import React from 'react';
import axios from 'axios';
import { ColDef, ICellRendererParams, RowNode } from '@ag-grid-community/core';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';
import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import EmployeeSelectModal, { ComUser } from '~components/EmployeeSelectModal';

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
  if (!date) return null; 

  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date; 
  } else {
    console.warn("알 수 없는 날짜 형식:", date);
    return null; 
  }
  if (isNaN(dateObj.getTime())) {
    console.warn("유효하지 않은 날짜 값:", date);
    return null;
  }

  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
};


const convertDatesInRow = (row: any) => {
  const newRow = { ...row };
  if (newRow.startDate) {
    newRow.startDate = formatDateForServer(newRow.startDate);
  }
  if (newRow.endDate) {
    newRow.endDate = formatDateForServer(newRow.endDate);
  }

  return newRow;
};

const ProjectList: React.FC = () => {
  const gridRef = React.useRef<AgGridWrapperHandle>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [currentRowNode, setCurrentRowNode] = React.useState<RowNode | null>(
    null
  );

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
        }));
        gridRef.current?.setRowData(aData);
      }
    } catch (error) {
      console.error('프로젝트 목록을 불러오는 데 실패했습니다.', error);
    }
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSave = React.useCallback(
    async (lists: {
      deleteList: any[];
      updateList: any[];
      createList: any[];
    }) => {
      console.log('저장할 데이터 (변환 전):', lists);

      if (
        lists.createList.length === 0 &&
        lists.updateList.length === 0 &&
        lists.deleteList.length === 0
      ) {
        alert('저장할 변경 내용이 없습니다.');
        return;
      }

      const payload = {
        deleteList: lists.deleteList,
        updateList: lists.updateList.map(convertDatesInRow), // 날짜 변환 적용
        createList: lists.createList.map(convertDatesInRow), // 날짜 변환 적용
      };

      console.log('서버로 보낼 데이터 (변환 후):', payload);

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
        console.error('데이터 저장에 실패했습니다.', error);
        alert('데이터 저장 중 오류가 발생했습니다.');
      }
    },
    [fetchProjects]
  );

  const handleGridReady = React.useCallback(() => {
    setTimeout(() => {
      const gridApi = gridRef.current?.gridApi;
      if (gridApi) {
        gridApi.sizeColumnsToFit();

        gridApi.redrawRows();
      }
    }, 0);
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

          if (cachedTabs.length >= 8) {
            // (수정) 8개 '이상'일 경우
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
          console.error('persist:rootTabs 파싱 실패:', e, rootTabsData);
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
    [dispatch, navigate]
  );

  const handleCellClick = React.useCallback(
    (event: any) => {
      const projectData = event.data;
      const columnId = event.column.getColId();

      if (columnId === 'pmId' && projectData?.isCreated === true) {
        setCurrentRowNode(event.node);
        setIsModalOpen(true);
        return;
      }
      if (!projectData || !projectData.projectId) {
        return;
      }

      handleSelectTab({
        key: `project-detail-${projectData.projectId}`,
        label: `Project Detail : ${projectData.projectName || projectData.projectCode}`,

        path: `/main/project/detail/${projectData.projectId}`,
      });
    },
    [handleSelectTab]
  );

  const handleEmployeeSelect = (user: ComUser) => {
    if (currentRowNode) {
      currentRowNode.setDataValue('pmId', user.userId);
      setIsModalOpen(false);
      setCurrentRowNode(null);
    }
  };

  const handleModalHide = () => {
    setIsModalOpen(false);
    setCurrentRowNode(null);
  };
  const [columnDefs] = React.useState<ColDef[]>([
    {
      headerName: '프로젝트 코드',
      field: 'projectCode',
      editable: (params) => params.data.isCreated === true,
      width: 170,
    },
    {
      headerName: '프로젝트명',
      field: 'projectName',
      editable: true,
      width: 250,
    },
    {
      headerName: '진행 단계',
      field: 'step',
      editable: true,
      width: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: [
          'IN PLANNING',
          'PREPARING',
          'IN PROGRESS',
          'WAITING FOR ACCEPTANCE',
          'CLOSED',
        ],
      },
    },
    {
      headerName: '시작일',
      field: 'startDate',
      editable: true,
      cellEditor: 'agDateCellEditor',
      width: 120,
    },
    {
      headerName: '종료일',
      field: 'endDate',
      editable: true,
      cellEditor: 'agDateCellEditor',
      width: 120,
    },
    {
      headerName: '전체 진행률',
      field: 'overallProgress',
      width: 200,
      cellRenderer: ProgressBarRenderer,
      editable: false,
    },
    {
      headerName: '프로젝트 상태',
      field: 'projectStatus',
      editable: true,
      width: 120,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['WAITING', 'ON-TIME', 'SERIOUS', 'CLOSED'],
      },
    },
    {
      headerName: '담당 PM ID',
      field: 'pmId',
      width: 120,
      cellStyle: (params) => {
        if (params.data?.isCreated === true) {
          return {
            cursor: 'pointer',
            backgroundColor: '#f8f9fa', // 약간 다른 배경색
            color: '#007bff', // 파란색 텍스트
          };
        }
        return null;
      },
    },
    {
      headerName: '상세 설명',
      field: 'description',
      editable: true,
      cellEditor: 'agLargeTextCellEditor',
      width: 300,
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
          <Col className="search_btn"></Col>
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
              onCellClicked={handleCellClick}
            />
          </Col>
        </Row>
      </Row>
      <EmployeeSelectModal
        show={isModalOpen}
        onHide={handleModalHide}
        onSelect={handleEmployeeSelect}
      />
    </Container>
  );
};

export default ProjectList;