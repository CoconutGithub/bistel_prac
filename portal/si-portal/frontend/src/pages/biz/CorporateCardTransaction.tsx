import React, { useRef, useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import { ComAPIContext } from '~components/ComAPIContext';
import AccountNameModal from '~components/cat/AccountNameModal';
import axios from 'axios';
import { cachedAuthToken } from '~store/AuthSlice';
import ProjectSearchModal from "~components/cat/ProjectSearchModal";
import attachIcon from '~assets/attach.png';
import { ColDef, CellClassParams } from '@ag-grid-community/core';
import AttachmentModal from "~components/cat/AttachmentModal";
import RecipeDetailModal from "~components/cat/RecipeDetailModal";
import {CorporateCardTransactionData} from "~types/CorporateCardTransactionData";

interface RowState {
    modified: boolean;
    data: Record<string ,any>
}

const CorporateCardTransaction: React.FC = () => {
  console.log('@@@@@@@@@@@@@ CorporateCardTransaction 수행됨...');

  const comAPIContext = useContext(ComAPIContext);
  const gridRef = useRef<AgGridWrapperHandle>(null);

  // 날짜 필터 상태
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState<string>(
    firstDay.toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    lastDay.toISOString().split('T')[0]
  );

  // 현재 선택한 행 상태 (모든 모달에서 공용)
  const [currentRowNode, setCurrentRowNode] = useState<any>(null);

  // 변경된 행 상태 추적
  const [modifiedRows, setModifiedRows] = useState<Record<string, RowState>>({});

  // 모달 표시 상태
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showProjectSearchModal, setShowProjectSearchModal] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showRecipeDetailModal, setShowRecipeDetailModal] = useState(false);

  // 계정명 선택 핸들러
  const handleAccountSelect = (accountName: string) => {
    if (currentRowNode) {
      currentRowNode.setDataValue('accountName', accountName);
    }
  };

  // 프로젝트 선택 핸들러
  const handleProjectSelect = (projectData: any) => {
    if (currentRowNode) {
      currentRowNode.setDataValue('projectCode', projectData.projectCode);
      currentRowNode.setDataValue('projectName', projectData.projectName);
    }
    setShowProjectSearchModal(false);
  };

  // 첨부파일 아이콘 클릭 핸들러
  const handleAttachmentClick = (params: any) => {
    setCurrentRowNode(params.node);
      setShowAttachmentModal(true);
  };

  const handleCellEdit = (rowId: string, field: string, newValue: any) => {
      setModifiedRows(prev => ({
          ...prev,
          [rowId]: {
              modified: true,
              data: { ...prev[rowId]?.data, [field]: newValue }
          }
      }));
  }

    // Cell 값 변경 시
    const handleCellValueChanged = (event: any) => {
        const { data, colDef } = event;
        console.log(`${colDef.field} changed to ${data[colDef.field]}`);

        // modifiedRows 상태 업데이트
        handleCellEdit(data.gridRowId, colDef.field, data[colDef.field]);
    };

    // Cell 편집 시작
    const handleCellEditingStarted = (event: any) => {
        console.log('편집 시작:', event.colDef.field);
    };

    // Cell 편집 종료
    const handleCellEditingStopped = (event: any) => {
        console.log('편집 종료:', event.colDef.field);
    };

  const columnDefs: ColDef[] = [
    { field: 'gridRowId', headerName: 'gridRowId', editable: false, hide: true },
    {
        headerName: '상태',
        field: 'status',
        editable: false,
        width: 100,
        cellStyle: {
            color: 'green',
            fontWeight: 'bold'
        }
    },
    {
        headerName: '승인일자',
        field: 'approvalDate',
        editable: false,
        width: 120,
        valueFormatter: (params: any) => {
            if (!params.value) return '';
            return params.value.split('T')[0];
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
            console.log("click approval data cell")
        },
    },
    {
        headerName: '카드유형',
        field: 'cardType',
        editable: false,
        width: 130,
        cellStyle: {
            color: 'black',
            fontWeight: 'bold'
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
        headerName: '취소여부',
        field: 'isCancelled',
        editable: false,
        width: 100,
        cellRenderer: (params: any) => params.value ? '취소' : '승인',
        cellStyle: {
            color: 'black',
            fontWeight: 'bold'
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
        headerName: '사용처',
        field: 'merchantName',
        editable: false,
        width: 150,
        cellStyle: {
            color: "black",
            fontWeight: "bold"
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
        headerName: '업종명',
        field: 'merchantCategory',
        editable: false,
        width: 120,
        cellStyle: {
            color: "black",
            fontWeight: "bold"
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
        headerName: '사용액',
        field: 'transactionAmount',
        editable: false,
        width: 120,
        valueFormatter: (params: any) => {
            if (params.value === null || params.value === undefined) return '';
            return params.value.toLocaleString();
        },
        cellStyle: {
            color: 'red',
            fontWeight: 'bold'
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
        headerName: '분할',
        field: 'splitCount',
        editable: false,
        width: 80,
        valueFormatter: (params: any) => {
            if (params.value === null || params.value === 1) return '';
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
        headerName: '공급가액',
        field: 'supplyAmount',
        editable: true,
        width: 120,
        valueFormatter: (params: any) => {
            if (params.value === null || params.value === undefined) return '';
            return params.value.toLocaleString();
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
        headerName: '부가세',
        field: 'taxAmount',
        editable: false,
        width: 100,
        valueFormatter: (params: any) => {
            if (params.value === null || params.value === undefined) return '';
            return params.value.toLocaleString();
        },
        onCellClicked: (params: any) => {
            setCurrentRowNode(params.node);
            setShowRecipeDetailModal(true);
        },
    },
    {
      headerName: '계정명',
      field: 'accountName',
      editable: false, // 직접 편집 불가
      width: 120,
      onCellClicked: (params: any) => {
        setCurrentRowNode(params.node);
        setShowAccountModal(true);
      },
    },
    {
        headerName: '프로젝트코드',
        field: 'projectCode',
        editable: true,
        width: 130,
        onCellClicked: (params:any)=> {
            setCurrentRowNode(params.node)
            setShowProjectSearchModal(true);
        }
    },
    {
        headerName: '프로젝트명',
        field: 'projectName',
        editable: true,
        width: 150,
        onCellClicked: (params:any)=> {
            setCurrentRowNode(params.node)
            setShowProjectSearchModal(true);
        }
    },
    { headerName: '적요', field: 'description', editable: true, width: 200 },
    {
        headerName: '첨부파일',
        cellRenderer: (params:any)=> {
            return (
                <img
                    src={attachIcon}
                    alt="attach"
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                    onClick={() => handleAttachmentClick(params)}
                />
            );
        },
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        width: 150
    },
    { headerName: '사전품의서', field: 'preApprovalFileName', editable: false, width: 150 },
    {
        headerName: '전기일자',
        field: 'transactionDate',
        editable: false,
        width: 120,
        valueFormatter: (params: any) => {
            if (!params.value) return '';
            return params.value.split('T')[0];
        }
    },
  ];

  // 데이터 로드 함수
  const fetchTransactions = () => {
    comAPIContext.showProgressBar();

    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/cct`, {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
        params: {
          startDate: startDate,
          endDate: endDate,
        },
      })
      .then((response) => {
        if (response.data) {
          const transactionsWithId = response.data.map(
            (item: CorporateCardTransactionData, index: number) => ({
              ...item,
              gridRowId: item.id || index,
            })
          );
          gridRef.current?.setRowData(transactionsWithId);

        }
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
        comAPIContext.showToast(
          comAPIContext.$msg(
            'message',
            'load_fail',
            '조회 중 오류가 발생했습니다.'
          ),
          'danger'
        );
      })
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  // 그리드 로드 후 데이터 세팅
  const setTransactionData = () => {
    fetchTransactions();
  };

  // 저장 핸들러
  const handleSave = (lists: {
    deleteList: any[];
    updateList: any[];
    createList: any[];
  }) => {
    console.log('Save data:', lists);

    comAPIContext.showProgressBar();

    const payload = Object.entries(modifiedRows).map(([id, state])=>({
        "cctId": Number(id),
        "accountName": state.data?.accountName,
        "projectName": state.data?.projectName,
        "projectCode": state.data?.projectCode,
        "description": state.data?.description
    }))

    axios
      .patch(
        `${process.env.REACT_APP_BACKEND_IP}/cct`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${cachedAuthToken}`,
          },
        }
      )
      .then((response) => {
        comAPIContext.showToast(
          comAPIContext.$msg(
            'message',
            'save_success',
            '저장이 완료되었습니다.'
          ),
          'success'
        );
        // 저장 후 재조회
        fetchTransactions();
      })
      .catch((error) => {
        console.error('Save error:', error);
        comAPIContext.showToast(
          comAPIContext.$msg('message', 'save_fail', '저장이 실패했습니다.'),
          'danger'
        );
      })
      .finally(() => {
        comAPIContext.hideProgressBar();
        setModifiedRows({});
      });
  };

  // 조회 버튼 핸들러
  const handleSearch = () => {
    fetchTransactions();
  };

  return (
    <Container fluid>
      <h4 className="mb-4">법인카드 사용내역</h4>

      {/* 날짜 필터 */}
      <Row className="mb-3">
        <Col md={12}>
          <Form className="d-flex align-items-center gap-3">
            <Form.Group className="d-flex align-items-center gap-2">
              <Form.Label className="mb-0">시작일:</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '200px' }}
              />
            </Form.Group>

            <Form.Group className="d-flex align-items-center gap-2">
              <Form.Label className="mb-0">종료일:</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '200px' }}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleSearch}>
              조회
            </Button>
          </Form>
        </Col>
      </Row>

      {/* AG Grid */}
      <Row>
        <Col>
          <AgGridWrapper
            ref={gridRef}
            tableHeight="700px"
            pagination={true}
            columnDefs={columnDefs}
            canCreate={false}
            canUpdate={true}
            canDelete={false}
            onGridLoaded={setTransactionData}
            onSave={handleSave}
            onCellValueChanged={handleCellValueChanged}
            onCellEditingStarted={handleCellEditingStarted}
            onCellEditingStopped={handleCellEditingStopped}
          />
        </Col>
      </Row>

      {/* 계정명 선택 모달 */}
      <AccountNameModal
        show={showAccountModal}
        onHide={() => setShowAccountModal(false)}
        onSelect={handleAccountSelect}
        currentValue={currentRowNode?.data?.accountName}
      />

      <ProjectSearchModal
        show={showProjectSearchModal}
        onHide={() => setShowProjectSearchModal(false)}
        onSelect={handleProjectSelect}
        currentValue={currentRowNode?.data?.projectId}
      />

      <AttachmentModal
        show={showAttachmentModal}
        onHide={() => setShowAttachmentModal(false)}
        onSelect={handleProjectSelect}
        currentValue={currentRowNode?.data?.projectId}
        selectedCct={currentRowNode?.data?.id}
      />

      <RecipeDetailModal
          show={showRecipeDetailModal}
          onHide={()=>setShowRecipeDetailModal(false)}
          onSelect={() => {}}
          currentValue={currentRowNode?.data}
      />
    </Container>
  );
};

export default CorporateCardTransaction;