import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { ColDef, ICellRendererParams, RowNode } from '@ag-grid-community/core';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { addTab, setActiveTab } from '~store/RootTabs';
import HumanResourcePivotGrid from '~components/HumanResourcePivotGrid';
import EmployeeSelectModal, { ComUser } from '~components/EmployeeSelectModal';
import ResourceDetailModal, { SaveData as ResourceSaveData } from '~components/ResourceDetailModal';

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

// ProjectProgressDetail 그리드용 타입
interface IProjectProgressDetail {
    gridRowId: string; // AgGrid의 행 구분을 위한 고유 ID
    detailId?: number; // 기존 데이터 식별자
    taskName: string;
    progressPercentage: number;
    weight: number;
    description: string;
    assigneeId: string;
    isCreated?: boolean; // 신규 행 여부
    isUpdated?: boolean; // 수정된 행 여부
}

// ProjectHumanResource 그리드용 타입
interface IProjectHumanResource {
    gridRowId: string; // AgGrid의 행 구분을 위한 고유 ID
    resourceAllocationId?: number; // 기존 데이터 식별자
    userId: string;
    roleId: number | null; // Role 엔티티 대신 ID로 관리 (혹은 Role 객체 전체)
    plannedMm: number;
    actualMm: number;
    actualStartDate: string; // YYYY-MM-DD
    actualEndDate: string; // YYYY-MM-DD
    plannedStartDate: string; // YYYY-MM-DD
    plannedEndDate: string; // YYYY-MM-DD
    isCreated?: boolean; // 신규 행 여부
    isUpdated?: boolean; // 수정된 행 여부
}

interface IProjectDetailData {
    projectId: number | null;
    projectName: string;
    projectCode: string;
    projectDescription: string; // DTO의 description
    projectStatus: string;
    step: string;
    pmId: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    overallProgress: number;
    progressDetails: IProjectProgressDetail[]; // DTO의 projectProgressDetails
    humanResources: IProjectHumanResource[]; // 이미지 기반 추가
}

// 초기 상태값
const initialState: IProjectDetailData = {
    projectId: null,
    projectName: '',
    projectCode: '',
    projectDescription: '',
    projectStatus: 'WAITING',
    step: 'IN PLANNING',
    pmId: '',
    startDate: '',
    endDate: '',
    overallProgress: 0,
    progressDetails: [],
    humanResources: [],
};
const roundToOne = (num: number): number => {
  return Math.round(num * 10) / 10;
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<IProjectDetailData>(initialState);
  const [deletedProgressDetails, setDeletedProgressDetails] = useState<number[]>([]);

  const progressGridRef = useRef<AgGridWrapperHandle>(null);
  // const resourceGridRef = useRef<AgGridWrapperHandle>(null);

  const [activeTabKey, setActiveTabKey] = useState('progress');

  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [currentModalType, setCurrentModalType] = useState<'planned' | 'actual'>('planned');

  const [selectedEmployee, setSelectedEmployee] = useState<ComUser | null>(null);

  const [showPmSelectModal, setShowPmSelectModal] = useState(false);
  const [showAssigneeSelectModal, setShowAssigneeSelectModal] = useState(false);
  const [currentProgressRowNode, setCurrentProgressRowNode] = useState<RowNode | null>(null);

  useEffect(() => {
    const fetchProjectDetail = async (projectId: number) => {
      try {
        const token = sessionStorage.getItem('authToken');

        const response = await axios.get(`http://localhost:8080/project/detail/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;

        const formatDate = (dateStr: string | null | undefined) => {
          if (!dateStr) return '';
          return dateStr.split('T')[0];
        };

        const unsortedProgressDetails = (data.projectProgressDetails || []).map((item: any, index: number) => ({
          ...item,
          gridRowId: item.detailId || `temp-progress-${index}`,
        }));

        //'detailId' 기준으로 오름차순 정렬합니다.
        const sortedProgressDetails = unsortedProgressDetails.sort((a: IProjectProgressDetail, b: IProjectProgressDetail) => {
          const idA = a.detailId || 0;
          const idB = b.detailId || 0;
          return idA - idB;
        });

        const formattedData: IProjectDetailData = {
          ...data,

          // --- 폼 입력 필드 Null Safety 처리 ---
          projectName: data.projectName || '', // null이면 ""
          projectCode: data.projectCode || '', // null이면 ""
          projectDescription: data.projectDescription || '', // null이면 ""
          projectStatus: data.projectStatus || 'PLANNING', // null이면 기본값
          step: data.step || 'PROPOSAL', // null이면 기본값
          pmId: data.pmId || '', // null이면 ""
          overallProgress: data.overallProgress || 0,

          // --- 날짜 및 그리드 처리 (기존과 동일) ---
          startDate: formatDate(data.startDate),
          endDate: formatDate(data.endDate),
          progressDetails: sortedProgressDetails,
          humanResources: (data.projectHumanResources || []).map((item: any, index: number) => ({
            ...item,
            gridRowId: item.resourceAllocationId || `temp-resource-${index}`,
            actualStartDate: formatDate(item.actualStartDate),
            actualEndDate: formatDate(item.actualEndDate),
            plannedStartDate: formatDate(item.plannedStartDate),
            plannedEndDate: formatDate(item.plannedEndDate),
          })),
        };
        setFormData(formattedData);
        progressGridRef.current?.setRowData(formattedData.progressDetails);

      } catch (error) {
        console.error('프로젝트 상세 정보를 불러오는 데 실패했습니다.', error);
        alert('데이터 로드 실패');
      }
    };

    if (id) {
      fetchProjectDetail(Number(id));
    }
  }, [id]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // --- (수정) 1. 기간 기반 진행률 계산 ---
  const timeBasedProgress = useMemo(() => {
    const { startDate, endDate } = formData;
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // 시간, 분, 초를 0으로 설정하여 날짜만 비교
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

    // 프로젝트 시작 전
    if (today < start) return 0;
    // 프로젝트 종료 후
    if (today > end) return 100;

    const totalDuration = end.getTime() - start.getTime();
    // 기간이 0일 경우 (시작=종료)
    if (totalDuration === 0) {
      return (today >= start) ? 100 : 0;
    }

    const elapsedDuration = today.getTime() - start.getTime();

    const progress = (elapsedDuration / totalDuration) * 100;
    return Math.round(progress); // 정수로 반올림
  }, [formData.startDate, formData.endDate]);

  // --- (수정) 2. M/M 합계 계산 ---
  const mmTotals = useMemo(() => {
    const totals = formData.humanResources.reduce(
      (acc, resource) => {
        // API 응답이 문자열일 수 있으므로 Number로 명시적 변환
        acc.planned += Number(resource.plannedMm) || 0;
        acc.actual += Number(resource.actualMm) || 0;
        return acc;
      },
      { planned: 0, actual: 0 }
    );

    return {
      planned: roundToOne(totals.planned),
      actual: roundToOne(totals.actual),
    };
  }, [formData.humanResources]);

  // 진행 상세 (ProjectProgressDetail) 컬럼
  const progressColumns = useMemo<ColDef[]>(() => [
    { headerName: '작업명', field: 'taskName', editable: true, flex: 1.5 },
    {
      headerName: '담당자',
      field: 'assigneeId',
      editable: false,
      flex: 1,
      cellStyle: (params) => {
        if (params.data?.isCreated === true) {
          return {
            cursor: 'pointer',
            backgroundColor: '#f8f9fa', // 다른 배경색
            color: '#007bff', // 파란색 텍스트
          };
        }
        return null;
      }
    },
    {
      headerName: '진행률(%)',
      field: 'progressPercentage',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      cellRenderer: ProgressBarRenderer,
      flex: 1.5,
    },
    {
      headerName: '가중치(%)',
      field: 'weight',
      editable: true,
      cellEditor: 'agNumberCellEditor',
      flex: 0.7,
    },
    {
      headerName: '상세설명',
      field: 'description',
      editable: true,
      cellEditor: 'agLargeTextCellEditor',
      flex: 3,
    },
  ], []);

  // // 투입 인력 (ProjectHumanResource) 컬럼
  // const resourceColumns = useMemo<ColDef[]>(() => [
  //     { headerName: '인력 (UserID)', field: 'userId', editable: true, flex: 1 },
  //     {
  //         headerName: '역할 (RoleID)',
  //         field: 'roleId',
  //         editable: true,
  //         cellEditor: 'agNumberCellEditor',
  //         flex: 1
  //     },
  //     {
  //         headerName: '계획 M/M',
  //         field: 'plannedMm',
  //         editable: true,
  //         cellEditor: 'agNumberCellEditor',
  //         flex: 1
  //     },
  //     {
  //         headerName: '실행 M/M',
  //         field: 'actualMm',
  //         editable: true,
  //         cellEditor: 'agNumberCellEditor',
  //         flex: 1
  //     },
  //     {
  //         headerName: '실제 투입일',
  //         field: 'actualStartDate',
  //         editable: true,
  //         cellEditor: 'agDateCellEditor',
  //         flex: 1
  //     },
  //     {
  //         headerName: '실제 종료일',
  //         field: 'actualEndDate',
  //         editable: true,
  //         cellEditor: 'agDateCellEditor',
  //         flex: 1
  //     },
  //     {
  //         headerName: '예상 투입일',
  //         field: 'plannedStartDate',
  //         editable: true,
  //         cellEditor: 'agDateCellEditor',
  //         flex: 1
  //     },
  //     {
  //         headerName: '예상 종료일',
  //         field: 'plannedEndDate',
  //         editable: true,
  //         cellEditor: 'agDateCellEditor',
  //         flex: 1
  //     },
  // ], []);

  // --- 상단 버튼 핸들러 (저장/삭제) ---
  const handleSelectTab = React.useCallback(
    (tab: { key: string; label: string; path: string }) => {
      const rootTabsData = sessionStorage.getItem('persist:rootTabs');
      if (rootTabsData) {
        const parsedData = JSON.parse(rootTabsData);
        const cachedTabs = JSON.parse(parsedData.tabs);

        if (cachedTabs.length === 8) {
          alert('최대 8개의 탭만 열 수 있습니다.');
          // 탭 닫기 실패 시에도 이동은 시도
          dispatch(setActiveTab(tab.key));
          navigate(tab.path);
          return;
        } else {
          // 리스트 탭이 이미 있는지 확인
          const listTab = cachedTabs.find((t: any) => t.key === tab.key);
          if (!listTab) {
            dispatch(addTab(tab));
          }
          dispatch(setActiveTab(tab.key));
          navigate(tab.path);
        }
      } else {
        // 비상 처리
        dispatch(addTab(tab));
        dispatch(setActiveTab(tab.key));
        navigate(tab.path);
      }
    },
    [dispatch, navigate],
  );

  const handlePmSelectClick = useCallback(() => {
    setShowPmSelectModal(true);
  }, []);

  const handlePmSelectHide = useCallback(() => {
    setShowPmSelectModal(false);
  }, []);

  const handlePmSelectConfirm = useCallback((user: ComUser) => {
    setFormData(prev => ({
      ...prev,
      pmId: user.userId,
    }));
    setShowPmSelectModal(false);
  }, []);

  const handleProgressCellClick = useCallback((event: any) => {
    const columnId = event.column.getColId();
    const data = event.data;
    if (columnId === 'assigneeId' && data?.isCreated === true) {
      setCurrentProgressRowNode(event.node);
      setShowAssigneeSelectModal(true);      // 담당자 선택 모달 열기
    }
  }, []);


  const handleAssigneeSelectHide = useCallback(() => {
    setShowAssigneeSelectModal(false);
    setCurrentProgressRowNode(null);
  }, []);

  const handleAssigneeSelectConfirm = useCallback((user: ComUser) => {
    if (currentProgressRowNode) {
      currentProgressRowNode.setDataValue('assigneeId', user.userId);
    }
    setShowAssigneeSelectModal(false);
    setCurrentProgressRowNode(null);
  }, [currentProgressRowNode]);

  const handleAddClick = (type: 'planned' | 'actual') => {
    console.log(`[handleAddClick] '${type}' 인력 추가 버튼 클릭됨`);

    setCurrentModalType(type);
    setSelectedEmployee(null);
    setShowEmployeeModal(true);
  };

  const handleEmployeeSelect = (user: ComUser) => {
    console.log('[handleEmployeeSelect] 선택된 직원:', user);
    setSelectedEmployee(user);
    setShowEmployeeModal(false);
    setShowResourceModal(true);
  };

  const handleResourceAdd = async (modalData: ResourceSaveData) => {
    if (!selectedEmployee || !formData.projectId) {
      alert('필수 정보(직원 또는 프로젝트 ID)가 없습니다.');
      return;
    }
    const newResourceData = {
      projectId: formData.projectId,
      userId: selectedEmployee.userId,
      roleId: Number(modalData.roleId),
      plannedStartDate: currentModalType === 'planned' ? modalData.startDate : null,
      plannedEndDate: currentModalType === 'planned' ? modalData.endDate : null,
      plannedMm: currentModalType === 'planned' ? modalData.calculatedMm : 0,
      actualStartDate: currentModalType === 'actual' ? modalData.startDate : null,
      actualEndDate: currentModalType === 'actual' ? modalData.endDate : null,
      actualMm: currentModalType === 'actual' ? modalData.calculatedMm : 0,
    };

    console.log('신규 리소스 저장 (API 호출):', newResourceData);

    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:8080/project/resource/add',
        newResourceData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const savedResource: IProjectHumanResource = response.data;

      setFormData(prev => ({
        ...prev,
        humanResources: [...prev.humanResources, savedResource],
      }));

      setShowResourceModal(false); // 모달 2 닫기
      alert('인력이 성공적으로 추가되었습니다.');

    } catch (error: any) {
      console.error('인력 추가 실패:', error);
      if (error.response) {
        const { status, data } = error.response;
        alert(`인력 추가에 실패했습니다 (Status: ${status}): ${data || '서버 오류'}`);
      } else {
        alert('인력 추가 중 네트워크 오류가 발생했습니다.');
      }
    }
  };

  const handleResourceDelete = async (resourceAllocationId: number) => {
    if (!window.confirm('해당 인력 정보를 삭제하시겠습니까? (즉시 DB 반영)')) {
      return;
    }

    console.log('리소스 삭제 (API 호출):', resourceAllocationId);

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.delete(
        `http://localhost:8080/project/resource/delete/${resourceAllocationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setFormData(prev => ({
        ...prev,
        humanResources: prev.humanResources.filter(
          (res: IProjectHumanResource) => res.resourceAllocationId !== resourceAllocationId,
        ),
      }));
      alert('인력이 성공적으로 삭제되었습니다.');

    } catch (error: any) {
      console.error('인력 삭제 실패:', error);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || '알 수 없는 서버 오류';
        switch (status) {
          case 403:
            alert(`권한이 없습니다 : ${message}`);
            break;
          case 404:
            alert(`데이터를 찾을 수 없습니다 : ${message}`);
            break;
          case 500:
            alert(`서버 내부 오류가 발생했습니다.`);
            break;
          default:
            alert(`오류가 발생했습니다 (Status: ${status}): ${message}`);
        }
      } else {
        alert('인력 삭제 중 네트워크 오류가 발생했습니다.');
      }
    }
  };

  // 그리드 데이터를 제외하고, 상단의 프로젝트 '기본 정보'만 전송하도록 수정
  const handleUpdate = async () => {
    if (!formData.projectId) {
      alert('프로젝트 ID가 유효하지 않습니다.');
      return;
    }

    // 백엔드로 전송할 최종 '기본 정보' 데이터
    const dataToSave = {
      projectName: formData.projectName,
      projectDescription: formData.projectDescription, // DTO 필드명(description)에 맞게 매핑
      projectStatus: formData.projectStatus,
      step: formData.step,
      pmId: formData.pmId || null,
      startDate: formData.startDate, // 폼의 'date' input은 이미 YYYY-MM-DD 형식
      endDate: formData.endDate,     // 폼의 'date' input은 이미 YYYY-MM-DD 형식


    };

    console.log('Saving project info:', dataToSave);

    try {
      const token = sessionStorage.getItem('authToken');

      await axios.put(`http://localhost:8080/project/update/${formData.projectId}`, dataToSave, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('프로젝트 기본 정보가 성공적으로 수정되었습니다.');

      window.location.reload();

    } catch (error: any) {
      console.error('프로젝트 수정에 실패했습니다.', error);

      if (error.response) {
        // 서버가 에러 응답을 반환한 경우 (4xx, 5xx)
        const status = error.response.status;
        // 백엔드 컨트롤러가 body에 담아 보낸 에러 메시지
        const message = error.response.data || '알 수 없는 서버 오류';

        switch (status) {
          case 403: // Forbidden (PM 권한 없음)
            alert(`권한이 없습니다 : ${message}`);
            break;
          case 404: // Not Found (프로젝트 없음)
            alert(`데이터를 찾을 수 없습니다 : ${message}`);
            break;
          case 500: // Internal Server Error
            alert(`서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.`);
            break;
          default:
            alert(`오류가 발생했습니다. (Status: ${status})\n${message}`);
        }
        // window.location.reload();
      } else if (error.request) {
        // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 오류 등)
        alert('서버에서 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 요청을 설정하는 중에 발생한 오류
        alert(`오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  // 'Delete' 버튼 핸들러
  const handleDelete = async () => {
    if (!formData.projectId) {
      alert('프로젝트 ID가 유효하지 않습니다.');
      return;
    }

    if (!window.confirm('정말로 이 프로젝트를 삭제하시겠습니까? 하위 데이터가 모두 삭제됩니다.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.delete(`http://localhost:8080/project/delete/${formData.projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('프로젝트가 삭제되었습니다.');

      // 프로젝트 리스트 탭으로 이동
      handleSelectTab({
        key: 'project-list-key',
        label: '프로젝트 관리',
        path: '/main/project/list',
      });

    } catch (error: any) {
      console.error('프로젝트 삭제에 실패했습니다.', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || '알 수 없는 서버 오류';

        switch (status) {
          case 403: // Forbidden (PM 권한 없음)
            alert(`권한이 없습니다 : ${message}`);
            break;
          case 404: // Not Found (프로젝트 없음)
            alert(`데이터를 찾을 수 없습니다 : ${message}`);
            break;
          case 500: // Internal Server Error
            alert(`서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.`);
            break;
          default:
            alert(`오류가 발생했습니다. (Status: ${status})\n${message}`);
        }
        // window.location.reload();
      } else if (error.request) {
        // 요청은 보냈으나 응답을 받지 못한 경우 (네트워크 오류 등)
        alert('서버에서 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.');
      } else {
        // 요청을 설정하는 중에 발생한 오류
        alert(`오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  const handleProgressSave = async (lists: {
    deleteList: any[];
    updateList: any[];
    createList: any[];
  }) => {
    const { createList, updateList, deleteList } = lists;

    if (createList.length === 0 && updateList.length === 0 && deleteList.length === 0) {
      alert('저장할 변경 내용이 없습니다.');
      return;
    }
    // 백엔드로 보낼 데이터. projectId를 포함해야 합니다.
    const payload = {
      createList,
      updateList,
      deleteList,
    };

    console.log('Saving Progress Details:', payload);

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.post(`http://localhost:8080/project/progress/save/${formData.projectId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('진행 상세 정보가 성공적으로 저장되었습니다.');
      window.location.reload();

    } catch (error: any) {
      console.error('진행 상세 저장에 실패했습니다.', error);
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || '알 수 없는 서버 오류';
        switch (status) {
          case 400:
            alert(`저장 실패: ${message}`);
            break;//(가중치합이 !100)
          case 403:
            alert(`권한이 없습니다 : ${message}`);
            break; // (PM 권한)
          case 404:
            alert(`데이터를 찾을 수 없습니다 : ${message}`);
            break; // (프로젝트가 없음)
          case 500:
            alert(`서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.`);
            break;
          default:
            alert(`오류가 발생했습니다. (Status: ${status})\n${message}`);
        }
      } else {
        alert('서버 응답 오류. 네트워크를 확인해주세요.');
      }
    }
  };

  const handleTabSelect = useCallback((key: string | null) => {
    if (!key) return;
    setActiveTabKey(key);

    // 탭이 변경되어 그리드가 표시될 때, AgGrid의 크기를 다시 계산하도록 함
    setTimeout(() => {
      if (key === 'progress') {
        progressGridRef.current?.gridApi?.sizeColumnsToFit();
      } else if (key === 'resource') {
        // resourceGridRef.current?.gridApi?.sizeColumnsToFit();
      }
    }, 0);
  }, []);


  return (
    <Container fluid className="h-100 container_bg" style={{ padding: '20px' }}>
      <Row className="container_title" style={{ marginBottom: '20px' }}>
        <Col xs={6}>
          <h2>프로젝트 : {formData.projectName}</h2>
        </Col>
        <Col xs={6} className="d-flex justify-content-end">
          <Button
            variant="outline-danger"
            size="sm"
            style={{ marginRight: '10px' }}
            onClick={handleDelete}
          >
            프로젝트 삭제
          </Button>
          <Button variant="primary" size="sm" onClick={handleUpdate}>
            저장
          </Button>
        </Col>
      </Row>
      <Row className="container_contents">
        <Col>
          <Form>
            <Row>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={1}>
                  프로젝트명
                </Form.Label>
                <Col sm={6}>
                  <Form.Control
                    id="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                  />
                </Col>
              </Form.Group>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    프로젝트 코드
                  </Form.Label>
                  <Col sm={5}>
                    <Form.Control
                      id="projectCode"
                      value={formData.projectCode}
                      readOnly
                      disabled
                    />
                  </Col>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    진행률
                  </Form.Label>
                  <Col sm={4}>
                    <Form.Control
                      id="overallProgress"
                      value={`${formData.overallProgress} / ${timeBasedProgress}`}
                      readOnly
                      disabled
                      title={`실제 진행률: ${formData.overallProgress}% / 기간 진행률: ${timeBasedProgress}%`}
                    />
                  </Col>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    M/M
                  </Form.Label>
                  <Col sm={5}>
                    <Form.Control
                      id="mmTotals"
                      value={`${mmTotals.actual} / ${mmTotals.planned}`}
                      readOnly
                      disabled
                      title={`실제 M/M 합계: ${mmTotals.actual} / 계획 M/M 합계: ${mmTotals.planned}`}
                    />
                  </Col>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={4}>
                    프로젝트 상태
                  </Form.Label>
                  <Col sm={4}>
                    <Form.Select
                      id="projectStatus"
                      value={formData.projectStatus}
                      onChange={handleInputChange}
                    >
                      <option value="WAITING">WAITING</option>
                      <option value="ON-TIME">ON-TIME</option>
                      <option value="SERIOUS">SERIOUS</option>
                      <option value="CLOSED">CLOSED</option>
                    </Form.Select>
                  </Col>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    진행 단계
                  </Form.Label>
                  <Col sm={5}>
                    <Form.Select
                      id="step"
                      value={formData.step}
                      onChange={handleInputChange}
                    >
                      <option value="IN PLANNING">IN PLANNING</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                      <option value="WAITING FOR ACCEPTANCE">
                        WAITING FOR ACCEPTANCE
                      </option>
                      <option value="CLOSED">CLOSED</option>
                    </Form.Select>
                  </Col>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    담당 PM
                  </Form.Label>
                  <Col sm={4}>
                    <Form.Control
                      id="pmId"
                      value={formData.pmId}
                      readOnly
                      onClick={handlePmSelectClick}
                      style={{ cursor: 'pointer' }}
                    />
                  </Col>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={3}>
                    기간
                  </Form.Label>
                  <Col sm={8}>
                    <Row className="g-2">
                      <Col md={6}>
                        {' '}
                        {/* 50% */}
                        <Form.Control
                          type="date"
                          id="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                        />
                      </Col>
                      <Col md={6}>
                        {' '}
                        {/* 50% */}
                        <Form.Control
                          type="date"
                          id="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>상세 설명</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>

          <Row style={{ marginTop: '20px' }}>
            <Col>
              <Tabs
                activeKey={activeTabKey}
                onSelect={handleTabSelect}
                id="project-detail-tabs"
                className="mb-3"
                fill
              >
                <Tab eventKey="progress" title="진행 상세 (Progress Details)">
                  {/* 진행 상세 그리드 */}
                  <AgGridWrapper
                    ref={progressGridRef}
                    columnDefs={progressColumns}
                    canCreate={true}
                    canDelete={true}
                    canUpdate={true}
                    showButtonArea={true}
                    tableHeight="400px"
                    useNoColumn={true}
                    onSave={handleProgressSave}
                    enableCheckbox={true}
                    onCellClicked={handleProgressCellClick}
                    pagination={false}
                  />
                </Tab>
                <Tab eventKey="resource" title="투입 인력 (Human Resources)">
                  {/* 투입 인력 그리드 */}
                  <HumanResourcePivotGrid
                    title="Planned Resource"
                    resources={formData.humanResources}
                    projectStartDate={formData.startDate}
                    projectEndDate={formData.endDate}
                    type="planned"
                    onAdd={() => handleAddClick('planned')}
                    onDelete={handleResourceDelete}
                  />
                  <HumanResourcePivotGrid
                    title="Actual Resource"
                    resources={formData.humanResources}
                    projectStartDate={formData.startDate}
                    projectEndDate={formData.endDate}
                    type="actual"
                    onAdd={() => handleAddClick('actual')}
                    onDelete={handleResourceDelete}
                  />
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* (1) 투입 인력(Human Resources) 탭용 모달 */}
      <EmployeeSelectModal
        show={showEmployeeModal}
        onHide={() => setShowEmployeeModal(false)}
        onSelect={handleEmployeeSelect}
      />

      {/* (2) 투입 인력 상세정보(ResourceDetail) 입력용 모달 */}
      <ResourceDetailModal
        show={showResourceModal}
        onHide={() => setShowResourceModal(false)}
        onSave={handleResourceAdd}
        type={currentModalType}
        // (주의) ComUser의 userName 키가 실제와 맞는지 확인 필요
        employeeName={selectedEmployee?.userName || ''}
        projectStartDate={formData.startDate}
        projectEndDate={formData.endDate}
      />

      {/* (3) 담당 PM (폼 필드) 선택용 모달 */}
      <EmployeeSelectModal
        show={showPmSelectModal}
        onHide={handlePmSelectHide}
        onSelect={handlePmSelectConfirm}
      />

      {/* (4) (추가) 진행 상세(Progress Detail) 그리드 담당자 선택용 모달 */}
      <EmployeeSelectModal
        show={showAssigneeSelectModal}
        onHide={handleAssigneeSelectHide}
        onSelect={handleAssigneeSelectConfirm}
      />
    </Container>
  );
};

export default ProjectDetail;