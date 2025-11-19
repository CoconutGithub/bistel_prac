import React, {useRef, useState, useEffect, useContext} from "react";
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import {Modal} from "react-bootstrap";
import {AgGridWrapperHandle} from "~types/GlobalTypes";
import axios from "axios";
import {cachedAuthToken} from "~store/AuthSlice";
import {ComAPIContext} from "~components/ComAPIContext";

interface ProjectSearchModalProps{
    show: boolean;
    onHide: () => void;
    onSelect: (accountName: string) => void;
    currentValue?: string | null;
}

interface ProjectData{
    projectId: number,
    projectCode: string,
    projectName: string,
    description: string,
    step: string,
    startDate: string | Date,
    endDate: string | Date,
    overallProgress: string,
    pmId: string
}

const ProjectSearchModal: React.FC<ProjectSearchModalProps> = ({
   show,
   onHide,
   onSelect,
   currentValue,
}) => {
    const comAPIContext = useContext(ComAPIContext);
    const columnDefs =
        [
            { field: 'gridRowId', headerName: 'gridRowId', editable: false, hide: true },
            {
                headerName: '프로젝트 코드',
                field: 'projectCode',
                editable: false,
                width: 300,
            },
            {
                headerName: '프로젝트명',
                field: 'projectName',
                editable: false,
                width: 520,
            },
            {
                headerName: '시작일',
                field: 'startDate',
                editable: false,
                width: 130,
            },
            {
                headerName: '종료일',
                field: 'endDate',
                editable: false,
                width: 130,
            },
            {
                headerName: '상태',
                field: 'step',
                editable: false,
                width: 130,
            }
    ];

    const gridRef = useRef<AgGridWrapperHandle>(null);

    const fetchProjects = ()=>{
        axios
            .get(`${process.env.REACT_APP_BACKEND_IP}/project/list`, {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                },
            })
            .then((response) => {
                if (response.data) {
                    const projectsWithId = response.data.map(
                        (item: ProjectData, index: number) => ({
                            ...item,
                            gridRowId: item.projectId || index,
                        })
                    );
                    gridRef.current?.setRowData(projectsWithId);
                }
            })
            .catch((error) => {
                console.error('Error fetching transactions:', error);
                comAPIContext.showToast(
                    comAPIContext.$msg(
                        'message',
                        'load_fail',
                        '프로젝트 정보 조회 중 오류가 발생했습니다.'
                    ),
                    'danger'
                );
            })
            .finally(() => {
                console.log("project list 조회")
            });
    }

    const setProjectData = () => {
        fetchProjects();
    };

    const handleSelect = (event: any) => {
        const selectedData = event.data;
        onSelect(selectedData)
        onHide();
        // setSearchTerm(''); // 검색어 초기화
    };


    return(
        <Modal
            show={show}
            onHide={onHide}
            centered
            size={"xl"}
        >
            <Modal.Header closeButton>
                <Modal.Title>ProjectSearch</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AgGridWrapper
                    ref={gridRef}
                    tableHeight="700px"
                    pagination={true}
                    columnDefs={columnDefs}
                    canCreate={false}
                    canUpdate={true}
                    canDelete={false}
                    onGridLoaded={setProjectData}
                    onRowClicked={handleSelect}
                />
            </Modal.Body>
        </Modal>
    );
};

export default ProjectSearchModal;