import React from 'react'; // (수정) useState, useCallback 등 임포트
import axios from 'axios';
import { ColDef, ICellRendererParams, RowNode } from '@ag-grid-community/core';
import { Container, Row, Col, Button } from 'react-bootstrap'; // (수정) Button 임포트 추가
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';
import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
// (수정) EmployeeSelectModal 임포트 제거 (ProjectAddModal이 관리)
// import EmployeeSelectModal, { ComUser } from '~components/EmployeeSelectModal';

// (추가) 신규 프로젝트 추가 모달 임포트 (경로 확인 필요)
import ProjectAddModal from '~components/ProjectAddModal';

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

  // (수정) '신규 프로젝트 추가' 모달 상태
  const [showAddModal, setShowAddModal] = React.useState(false);

  // (수정) 기존 인라인 PM ID 편집 로직 관련 state 제거
  // const [isModalOpen, setIsModalOpen] = React.useState(false);
  // const [currentRowNode, setCurrentRowNode] = React.useState<RowNode | null>(null);

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
      createList: any[]; // 이 인자는 이제 무시합니다.
    }) => {
      // 1. AgGridWrapper에서 updateList와 deleteList는 그대로 사용합니다.
      const { deleteList, updateList } = lists;

      // 2. createList는 AgGridWrapper에서 받은 것을 무시하고,
      //    그리드 API를 통해 현재 그리드에서 isCreated 플래그가 있는 행을 직접 찾습니다.
      const finalCreateList: any[] = [];
      // (수정) node 파라미터에 RowNode 타입을 명시적으로 지정
      gridRef.current?.gridApi?.forEachNode((node: RowNode) => {
        if (node.data && node.data.isCreated === true) {
          // isCreated 플א그가 있는 노드의 데이터를 가져옵니다.
          finalCreateList.push(node.data);
        }
      });

      console.log('수동으로 찾은 createList:', finalCreateList);
      console.log('AgGridWrapper가 전달한 updateList:', updateList);
      console.log('AgGridWrapper가 전달한 deleteList:', deleteList);


      // 3. 실제로 저장할 내용이 있는지 확인 (수동으로 찾은 createList 기준)
      if (
        finalCreateList.length === 0 &&
        updateList.length === 0 &&
        deleteList.length === 0
      ) {
        alert('저장할 변경 내용이 없습니다.');
        return;
      }

      // 4. 서버로 보낼 payload를 구성합니다. (날짜 변환 등 적용)
      const payload = {
        // deleteList는 id만 필요할 수 있으므로 변환 없이 사용 (필요시 수정)
        deleteList: deleteList,
        // updateList는 날짜 변환 적용
        updateList: updateList.map(convertDatesInRow),
        // 직접 찾은 finalCreateList에 날짜 변환 적용
        createList: finalCreateList.map(convertDatesInRow),
      };

      console.log('서버로 보낼 최종 payload:', payload);

      // 5. 서버로 데이터를 전송합니다.
      try {
        const token = sessionStorage.getItem('authToken');

        await axios.post('http://localhost:8080/project/save', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        alert('성공적으로 저장되었습니다.');
        // 저장 성공 후, 그리드 데이터를 새로고침하여 isCreated 등의 상태를 초기화합니다.
        fetchProjects();

      } catch (error) {
        console.error('데이터 저장에 실패했습니다.', error);
        alert('데이터 저장 중 오류가 발생했습니다.');
        // 실패 시에는 fetchProjects()를 호출하지 않아 사용자가 수정한 내용을 유지할 수 있습니다.
      }
    },
    [fetchProjects] // fetchProjects 의존성 유지
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

  // (수정) '추가' 버튼 클릭 시 모달 열기 핸들러
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  // (추가) 새 프로젝트 모달 저장 핸들러
  const handleSaveNewProject = React.useCallback((newProjectData: any) => {
    const newRowId = new Date().getTime() + Math.random().toString(36);

    // 모달 폼의 날짜 문자열(YYYY-MM-DD)을 Date 객체로 변환 (agDateCellEditor 호환)
    const startDate = newProjectData.startDate ? new Date(newProjectData.startDate) : null;
    const endDate = newProjectData.endDate ? new Date(newProjectData.endDate) : null;

    const newRow = {
      ...newProjectData,
      startDate: startDate, // Date 객체로
      endDate: endDate,   // Date 객체로
      isCreated: true,  // 새 행 플래그
      gridRowId: newRowId,
      overallProgress: 0, // 기본값
      // (참고) M/M은 상세에서 입력 (여기선 0 또는 기본값 설정)
      // plannedMm: 0,
      // actualMm: 0,
    };

    // 그리드에 새 행 추가 (AgGridWrapper 내부의 createList에 자동 등록됨)
    gridRef.current?.gridApi?.applyTransaction({
      add: [newRow],
      addIndex: 0, // 맨 위에 추가
    });

    setShowAddModal(false); // 모달 닫기
  }, []); // 의존성 없음

  // (수정) handleCellClick에서 'pmId' 관련 로직 제거
  const handleCellClick = React.useCallback(
    (event: any) => {
      const projectData = event.data;

      // (수정) 'pmId' 클릭 관련 로직 제거됨
      // if (columnId === 'pmId' && projectData?.isCreated === true) { ... }

      // (수정) 새 행(isCreated)이거나 projectId가 없으면 네비게이션 방지
      //    (모달로 생성하므로 isCreated 상태의 행 클릭은 사실상 발생하기 어려움)
      if (!projectData || !projectData.projectId) {
        return;
      }

      // 기존 행 클릭 시 상세 페이지로 이동
      handleSelectTab({
        key: `project-detail-${projectData.projectId}`,
        label: `Project Detail : ${projectData.projectName || projectData.projectCode}`,
        path: `/main/project/detail/${projectData.projectId}`,
      });
    },
    [handleSelectTab]
  );

  // (수정) 인라인 PM ID 편집 핸들러 (handleEmployeeSelect, handleModalHide) 제거

  const [columnDefs] = React.useState<ColDef[]>([
    {
      headerName: '프로젝트 코드',
      field: 'projectCode',
      // (수정) 모달로 생성 후 저장 전까지는 코드 수정 가능하도록 유지
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
      editable: true, // (수정) 이제 일반 편집 필드 (필요시 false로 변경)
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
              canCreate={false} // (수정) 래퍼의 '추가' 버튼 숨기기
              canUpdate={true}
              canDelete={true}
              onSave={handleSave}
              rowSelection="multiple"
              enableCheckbox={true}
              onGridLoaded={handleGridReady}
              onCellClicked={handleCellClick}
              // (수정) onAddClick={handleAddClick} 제거 (children으로 대체)
            >
              {/* (추가) children prop을 사용하여 커스텀 '추가' 버튼 전달 */}
              {/* AgGridWrapper의 ComButton과 스타일을 맞추기 위해
                  variant/size/margin을 설정합니다. */}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddClick} // 모달을 여는 핸들러
                style={{ marginRight: '5px' }} // '저장' 버튼과의 간격
              >
                추가
              </Button>
            </AgGridWrapper>
          </Col>
        </Row>
      </Row>

      {/* (추가) 신규 프로젝트 추가 모달 렌더링 */}
      <ProjectAddModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSave={handleSaveNewProject}
      />

      {/* (수정) 기존 EmployeeSelectModal 렌더링 제거 */}
    </Container>
  );
};

export default ProjectList;