import React, { useContext, useRef, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ComAPIContext } from '~components/ComAPIContext';
import ExamButton from '~pages/portal/example/ExamButton';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import FileCellRenderer from '~components/fileCellRenderer/FileCellRenderer';
import { AgGridWrapperHandle } from '~types/GlobalTypes';

const HowToUse: React.FC = () => {
  const comAPIContext = useContext(ComAPIContext); // ComAPIContext 사용
  const [selectedFilesMap, setSelectedFilesMap] = useState<any>({});

  // 예제 코드 문자열
  const examCodeProgressbar = `
        import { useContext } from 'react';
        import { ComAPIContext } from './ComAPIContext';
        
        const comAPIContext = useContext(ComAPIContext);
        //시작
        comAPIContext.showProgressBar();
        //끝
        comAPIContext.hideProgressBar();
    `;

  const examCodeToast = `
        import { useContext } from 'react';
        import { ComAPIContext } from './ComAPIContext';
        
        const comAPIContext = useContext(ComAPIContext);
    
        //option -> dark" | "success" | "danger" | "warning" | "info" | "success" 
        comAPIContext.showToast("write message in here" , "danger");
    `;

  const examCodeButtion = `
        import ComButton from "~pages/portal/buttons/ComButton";
        <ComButton size="sm" className="me-2" variant="primary">
              등록
        </ComButton>    
    `;

  const examAdminDesc = `
        P_ROLE 에 ROLE_NAME 이 'ADMIN 인게 ADMIN 이 아니고
        P_ROLE 에 IS_MIGHTY 컬럼 값이 Y 가 ADMIN 이다.
        ADMIN 이란 ROLE_NAME 은 SITE 마다 다 다를수 있기 때문에. (예: Administrator)
        IS_MIGHTY 가 'Y' 인 ROLE 은 P_PERMISSION 에 메뉴설정을 하지 않아도 된다.
       `;

  const examAgGrid = `
        //Import 추가    
        import AgGridWrapper from "~components/AgGridWrapper";
        
        //화면별 생성,삭제, 수정, 조회 버튼 권한 불러옴 
        const canCreate = useSelector((state: RootState) => state.auth.pageButtonAuth.canCreate);
        const canDelete = useSelector((state: RootState) => state.auth.pageButtonAuth.canDelete);
        const canUpdate = useSelector((state: RootState) => state.auth.pageButtonAuth.canUpdate);
        const canRead = useSelector((state: RootState) => state.auth.pageButtonAuth.canRead);
        
        const columnDefs = [
            { filed: 'gridRowId', field: 'h1', headerName: 'Header1', editable: true },
            { filed: 'gridRowId', field: 'h2', headerName: 'Headeer2', editable: true },
            {
                filed: 'gridRowId',
                field: 'attachFile',
                headerName: 'File',
                cellRenderer: FileCellRenderer,
                editable: false
            }
        ]
        
        <AgGridWrapper
            ref={gridRef} // forwardRef를 통해 연결된 ref
            enableCheckbox={true}
            showButtonArea={true}
            canCreate={canCreate}
            canDelete={canDelete}
            canUpdate={canUpdate}
            columnDefs={columnDefs}
        >
        </AgGridWrapper>        
        `;

  const columnDefs = [
    {
      filed: 'gridRowId',
      field: 'h1',
      headerName: 'Header1',
      editable: true,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    {
      filed: 'gridRowId',
      field: 'h2',
      headerName: 'Headeer2',
      editable: true,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    {
      filed: 'gridRowId',
      field: 'attachFile',
      headerName: 'File',
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
      flex: 2,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
  ];

  const handleRunProgress = () => {
    //Toast message 를 보여줌
    comAPIContext.showProgressBar();
    setTimeout(() => comAPIContext.hideProgressBar(), 3000); // 3초 후 숨김
  };

  const handleRunToastMsg = () => {
    //Button 사용 예
    comAPIContext.showToast('write message in here', 'danger');
  };

  const gridRef = useRef<AgGridWrapperHandle>(null);
  const searchGrid = () => {
    gridRef.current!.setRowData([
      { gridRowId: '1', h1: 'aaa', h2: 'bbb' },
      { gridRowId: '2', h1: 'aaa', h2: 'bbb' },
      { gridRowId: '3', h1: 'aaa', h2: 'bbb' },
    ]);
  };

  return (
    <Container>
      <Row className="text-center" style={{ marginTop: '50px' }}>
        <Col>
          <h1>Use Progress Bar</h1>
          <p>아래 코드는 Progress Bar를 표시하는 방법을 보여줍니다:</p>
          <pre
            style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              textAlign: 'left',
              overflowX: 'auto',
            }}
          >
            <code>{examCodeProgressbar}</code>
          </pre>
          <Button variant="primary" onClick={handleRunProgress}>
            Run Example
          </Button>
        </Col>
        <Col>
          <h1>Use Toast Message</h1>
          <p>아래 코드는 Toast Message를 표시하는 방법을 보여줍니다:</p>
          <pre
            style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              textAlign: 'left',
              overflowX: 'auto',
            }}
          >
            <code>{examCodeToast}</code>
          </pre>
          <Button variant="primary" onClick={handleRunToastMsg}>
            Run Example
          </Button>
        </Col>
      </Row>
      <Row className="text-center" style={{ marginTop: '50px' }}>
        <Col>
          <h1>Use Button</h1>
          <p>ComButton 을 사용해야 Session 유효시간을 체크 합니다.</p>
          <pre
            style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              textAlign: 'left',
              overflowX: 'auto',
            }}
          >
            <code>{examCodeButtion}</code>
          </pre>
          <ExamButton />
        </Col>
        <Col>
          <h1>Admin 개념</h1>
          <p>
            시스템의 모든 권한을 가진사람. 모든 메뉴 다 보임. 모든 버튼 다 사용
            가능
          </p>
          <pre
            style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              textAlign: 'left',
              overflowX: 'auto',
            }}
          >
            <code>{examAdminDesc}</code>
          </pre>
        </Col>
      </Row>
      <Row className="text-center" style={{ marginTop: '50px' }}>
        <Col>
          <h1>Ag Grid 기본 생성법 && File 첨부 방법</h1>
          <p>Ag Grid 에서 컬럼에 파일 추가하는 예제 입니다.</p>
          <pre
            style={{
              backgroundColor: '#f8f9fa',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              textAlign: 'left',
              overflowX: 'auto',
            }}
          >
            <code>{examAgGrid}</code>
          </pre>
          <Container className="d-flex">
            <Button
              size="sm"
              className="ms-auto mb-3"
              variant="primary"
              onClick={searchGrid}
            >
              조회
            </Button>
          </Container>
          <div>
            <AgGridWrapper
              ref={gridRef} // forwardRef를 통해 연결된 ref
              enableCheckbox={true}
              showButtonArea={true}
              canCreate={true}
              canDelete={true}
              canUpdate={true}
              columnDefs={columnDefs}
            ></AgGridWrapper>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HowToUse;
