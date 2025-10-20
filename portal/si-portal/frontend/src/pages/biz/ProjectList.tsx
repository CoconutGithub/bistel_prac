import React from 'react';
import axios from 'axios';
import { ColDef, ICellRendererParams } from '@ag-grid-community/core';
import { Container, Row, Col } from 'react-bootstrap';

// ## 제공해주신 AgGridWrapper와 관련 타입/컴포넌트를 import한다고 가정합니다. ##
// ## 경로와 파일명은 실제 프로젝트 구조에 맞게 수정이 필요합니다. ##
import AgGridWrapper from '../../components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '../../types/GlobalTypes';

// --- Progress Bar를 위한 커스텀 셀 렌더러 ---
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


/**
 * 프로젝트 관리 페이지 컴포넌트
 */
const ProjectList: React.FC = () => {
  const gridRef = React.useRef<AgGridWrapperHandle>(null);

  const fetchProjects = React.useCallback(async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/project/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        gridRef.current?.setRowData(response.data);
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
    console.log("저장할 데이터:", lists);

    if (lists.createList.length === 0 && lists.updateList.length === 0 && lists.deleteList.length === 0) {
      alert('저장할 변경 내용이 없습니다.');
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.post('http://localhost:8080/project/save', lists, {
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

  const [columnDefs] = React.useState<ColDef[]>([
    {
      headerName: '프로젝트 코드',
      field: 'projectCode',
      editable: (params) => params.data.isCreated === true,
      width: 150
    },
    {
      headerName: '프로젝트명',
      field: 'projectName',
      editable: true,
      width: 250
    },
    {
      headerName: '상세 설명',
      field: 'description',
      editable: true,
      cellEditor: 'agLargeTextCellEditor',
      width: 300
    },
    {
      headerName: '진행 단계',
      field: 'step',
      editable: true,
      width: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['PROPOSAL', 'ANALYSIS', 'DESIGN', 'DEVELOPMENT', 'TEST', 'DEPLOYMENT']
      }
    },
    {
      headerName: '시작일',
      field: 'startDate',
      editable: true,
      cellEditor: 'agDateCellEditor',
      width: 150
    },
    {
      headerName: '종료일',
      field: 'endDate',
      editable: true,
      cellEditor: 'agDateCellEditor',
      width: 150
    },
    {
      headerName: '전체 진행률',
      field: 'overallProgress',
      width: 180,
      cellRenderer: ProgressBarRenderer,
      editable: false
    },
    {
      headerName: '프로젝트 상태',
      field: 'projectStatus',
      editable: true,
      width: 150,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']
      }
    },
    {
      headerName: '담당 PM ID',
      field: 'pmId',
      editable: true,
      width: 120
    }
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
            />
          </Col>
        </Row>
      </Row>
    </Container>
  );
};

export default ProjectList;