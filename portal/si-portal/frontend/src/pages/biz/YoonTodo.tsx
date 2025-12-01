import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { cachedAuthToken } from '~store/AuthSlice';
import React, {useState, useRef, useEffect, useCallback, useContext, useMemo} from "react"; // React는 default export, useState는 기본 export 겠군
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import axios from 'axios';
import ComButton from '../portal/buttons/ComButton';
import { ComAPIContext } from '~components/ComAPIContext';
import { check } from 'prettier';
import { Prev } from 'react-bootstrap/lib/Pagination';
import { Modal } from 'react-bootstrap';
import YoonTodoCreatePopup from './YoonTodoCreatePopup';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/Store';
import { Container, Row, Col, Form } from 'react-bootstrap';

const progressItem = [
    {
        text: '진행중',
        value: 'progress'
    },
    {
        text: '완료',
        value: 'done'
    },
    {
        text: '미완료',
        value: 'inComplete'
    },
]

const YoonTodo=()=>{
    const state = useSelector((state: RootState) => state.auth);
    const [showPopup, setShowPopup] = useState(false);
    const [checkBox, setCheckBox] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [canDelete, setCanDelete]= useState(false);
    const [canUpdate, setCanUpdate]= useState(false);
    const [canCreate, setCanCreate]= useState(true);
    const gridRef = useRef<AgGridWrapperHandle>(null);
    const comAPIContext = useContext(ComAPIContext);

    const [columnDefs, setColumnDefs] = useState(
        [   
            {field : 'id' , hide: true, editable: false}, 
            {field : 'todoType' , editable: true}, 
            {field : 'worker' , editable: true},
            {field : 'title' , editable: true},
            {field : 'content' , editable: true},
            {
                field : 'dueDate',
                editable: true,
                filter: 'agDateColumnFilter',
                cellEditor: 'agDateCellEditor',
                valueGetter: (params:any) => {
                    const val = params.data.dueDate;
                    if (!val) return null;
                    // val이 string이면 Date로 변환
                    return val instanceof Date ? val : new Date(val);
                    },
                valueFormatter: (params: any) => {
                    if (!params.value) return '';
                    
                    const date = new Date(params.value);
                    if (isNaN(date.getTime())) return params.value;
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                }
            },
            {
                field : 'progressStatus' ,
                editable: true,
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: {
                    values: progressItem.map(item => item.value),
                },
                valueFormatter: (params: any) => {
                    const item = progressItem.find(p => p.value === params.value);
                    return item ? item.text : params.value;
                }
            },
            {
                field: 'createDate',
                headerName: '생성일',
                sortable: true,
                width: 200,
                filter: true,
            },
            {
                field: 'createBy',
                headerName: '등록자',
                sortable: true,
                width: 100,
                filter: true,
            },
            {
                field: 'updateDate',
                headerName: '수정일',
                sortable: true,
                width: 200,
                filter: true,
            },
            {
                field: 'updateBy',
                headerName: '수정자',
                sortable: true,
                width: 100,
                filter: true,
            },
        ]
    ); 

    useEffect(() => {
        console.log("editMode : " + editMode);
    }, [editMode]);
            
    const handleShowPopup=()=>{
        setShowPopup(true)
    }

    const handleClosePopup =() => {
        setShowPopup(false)
    }

    const changeEditMode=()=>{
        console.log("editMode: "+ editMode)
        setEditMode(Prev => !Prev);
        setCanDelete(Prev => !Prev);
        setCanUpdate(Prev => !Prev);
        setCheckBox(Prev => !Prev);
        setCanCreate(Prev => !Prev);
    };

    const handleSearch=async ()=>{
        comAPIContext.showProgressBar();
        axios.get(`${process.env.REACT_APP_BACKEND_IP}/api/todo`, {
            headers: {Authorization: `Bearer ${cachedAuthToken}`},
        })
        .then((res) => {
            console.log(`응답 데이터`, res.data);

            if (gridRef.current){
                gridRef.current.setRowData(res.data);
            }
        }).finally(() => {
            comAPIContext.hideProgressBar();
        });
    }
        
    const handleSave = useCallback(
        async (lists: { deleteList: any[]; updateList: any[], createList: any[] }) => {
        if (!gridRef.current) return;

        const validation = [...lists.createList, ...lists.updateList].filter(
            (row) => !row.dueDate
        );

        if (validation.length > 0) {
            comAPIContext.showToast('DueDate는 필수 입력 항목입니다.', 'danger');
            return;
        }

        if (lists.updateList.length === 0  && lists.createList.length === 0 && lists.deleteList.length === 0) {
            comAPIContext.showToast(
            comAPIContext.$msg(
                'message',
                'no_save_data',
                '저장할 데이터가 없습니다.'
            ),
            'dark'
            );
            return;
        }
        try {
            comAPIContext.showProgressBar();
            // const updateList= lists.updateList;

            lists.createList.map((r) => {
                r.userName = state.user?.userName;
            });
            lists.updateList.map((r) => {
                r.userName = state.user?.userName;
            });

            const payload = {
                createList: lists.createList,
                updateList: lists.updateList,
                deleteList: lists.deleteList,
            };

            axios
                .post(
                    `${process.env.REACT_APP_BACKEND_IP}/api/todo`,
                    payload,   // updateList
                    {
                    headers: { Authorization: `Bearer ${cachedAuthToken}` },
                    }
                )
                .then((res) => {
                    if (res.data) {
                        comAPIContext.showToast(
                            comAPIContext.$msg(
                            'message',
                            'save_complete',
                            '저장이 완료됐습니다.' +
                                `(update: ${res.data.updatedUsersCnt}, delete: ${res.data.deletedUsersCnt})`
                            ),
                            'success'
                    );
                    //  changeEditMode();// editMode 변경
                        handleSearch(); // 저장 후 최신 데이터 조회
                    
                    }
                });
        } catch(err) {
                console.error('Error saving data:', err);
                comAPIContext.showToast(
                    comAPIContext.$msg('message', 'save_fail', '저장이 실패했습니다.'),
                    'danger'
                );
                handleSearch();
                // changeEditMode();
        } finally {
            comAPIContext.hideProgressBar();
        }
    },[]);

    const handleDelete = useCallback((selectedRows: any[]) => {
        const selectedIds = selectedRows.map(row => row.id); //js 문법에 대한 이해가 부족함.
        console.log("handleDelete-selectedIds: "+ selectedIds)

        if (selectedIds.length === 0) {
            comAPIContext.showToast('삭제할 데이터가 없습니다.', 'dark');
            return;
        }
        const ids=selectedIds;

        // 서버에 삭제 요청
        axios.delete(`${process.env.REACT_APP_BACKEND_IP}/api/todo`,
            {
                data: ids, // { ids }가 아니라 ids만!
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
            }
        )
        .then(() => {
            // 서버에서 삭제 성공 시, 그리드에서도 바로 제거
            comAPIContext.showToast('삭제되었습니다.', 'success');
            handleSearch();
            changeEditMode();
        })
        .catch(() => {
            comAPIContext.showToast('삭제 실패', 'danger');
            handleSearch();
            changeEditMode();
        });
    },[]);

    const handleUpdate = () => {
        setColumnDefs((prev => {
            prev.map((r) => {
                if(r.field == 'title' || r.field == 'TodoType'|| r.field == 'ProgressStatus'|| r.field == 'content') {
                    r.editable = true
                    return r
                } else {
                    return r
                }
            })
            return prev
        }
        ))
        changeEditMode(); 
    }

    const updateButton = useMemo(()=>{
        return(
            <>
                <ComButton
                    size="sm"
                    className='me-2'
                    onClick={handleUpdate}
                    disabled={editMode}
                    >
                    {comAPIContext.$msg('label', 'update', 'Todo 수정')}
                </ComButton>
            </>
        )
    },[handleUpdate,canDelete])   

    const createButton = useMemo(()=>(
        <>
            <ComButton
                size="sm"
                className="me-2"
                onClick={handleShowPopup}
                disabled={!canCreate}
            >
                {comAPIContext.$msg('label', 'add Todo', 'Todo 추가')}
            </ComButton>
        </>
    ),[handleShowPopup,canCreate]);

    // useEffect(() => {
    //     if(gridRef.current){ // if문으로 데이터가 없는 경우를 고려하지 않으면 에러가 난다.
    //         gridRef.current?.setRowData(
    //                 [{gridRowId: 1, todoType: 'type', worker: 'yoonseok', title: '윤석의 할일', content: '윤석의 할일 내용', dueDate: '2025-07-10', progresStatus: '진행중'}]);
    //         }
    //     console.log("useEffect 공부")
    //     console.log("gridRef 출력: "+ gridRef.current?.getRowData());
    // },[])        

        //페이지 열 때 리스트 조회
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKEND_IP}/api/todo`, {
            headers: {Authorization: `Bearer ${cachedAuthToken}`},
        })
        .then((res) => {
            console.log(`응답 데이터`, res.data);

            if (gridRef.current){
                gridRef.current.setRowData(res.data);
            }
        });
    },[]);

    return (
    <Container fluid className="h-100 container_bg">
        <Row className="container_title">
            <Col>
                <h2>
                    {comAPIContext.$msg('menu', 'yoon_todo', 'Yoon Todo')}
                </h2>
            </Col>
        </Row>
        <Row className="container_contents">
            <Row className="search_wrap">
                {/* <div>
                    <h1>안녕하세요</h1>
                    <button onClick={handleShowPopup}>추가</button>
                </div> */}
                <Col className="search_cnt">
                </Col>
                <Col className="search_btn">
                    <ComButton size="sm" variant="primary" onClick={handleSearch}>
                        {comAPIContext.$msg('label', 'search', '검색')}
                    </ComButton>
                </Col>
            </Row>

            <Row className="contents_wrap">
                <Col>
                    <AgGridWrapper 
                        ref={gridRef} 
                        columnDefs={columnDefs} 
                        enableCheckbox={true}  // checkBox
                        showButtonArea={true}
                        canCreate={true}   // false
                        canDelete={true}
                        canUpdate={true}          
                        useNoColumn={true}
                        onSave={handleSave}
                        // onDelete={handleDelete}
                    >
                        {/* {createButton}
                        {updateButton} */}
                    </AgGridWrapper>
                </Col>
                    {/* {showPopup&&(
                        <YoonTodoCreatePopup 
                            show={showPopup}
                            onClose={handleClosePopup}
                            ></YoonTodoCreatePopup>) 
                    } */}
            </Row>
        </Row>
    </Container>
    );
}

export default YoonTodo;
