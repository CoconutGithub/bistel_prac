import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { cachedAuthToken } from '~store/AuthSlice';
import React, {useState, useRef, useEffect, useCallback, useContext, useMemo} from "react"; // React는 default export, useState는 기본 export 겠군
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import axios from 'axios';
import ComButton from '../portal/buttons/ComButton';
import { ComAPIContext } from '~components/ComAPIContext';
import { check } from 'prettier';





const YoonTodo=()=>{
    const [checkBox, setCheckBox] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [canDelete, setCanDelete]= useState(false);
    const [canUpdate, setCanUpdate]= useState(false);
    const [canCreate, setCanCreate]= useState(true);
    const gridRef = useRef<AgGridWrapperHandle>(null);
    const comAPIContext = useContext(ComAPIContext);
    // console.log('editMode', editMode)
        const [columnDefs, setColumnDefs] = useState(
        [   
            {field : 'id' , hide: true, editable: false}, 
            {field : 'todoType' , editable: false}, 
            {field : 'worker' , editable: false},
            {field : 'title' , editable: false},
            {field : 'content' , editable: false},
            {field : 'dueDate', editable: false },
            {field : 'progressStatus' , editable: false}
        ]
); 

        useEffect(() => {
             console.log("editMode : " + editMode);
            }, [editMode]);
                
        const openPopup=()=>{
            
        }

        const handleSearch=async ()=>{
            axios.get(`${process.env.REACT_APP_BACKEND_IP}/api/todo`, {
                headers: {Authorization: `Bearer ${cachedAuthToken}`},
            })
            .then((res) => {
                console.log(`응답 데이터`, res.data);

                if (gridRef.current){
                    gridRef.current.setRowData(res.data);
                }
            });
        }
        
        const handleSave = useCallback(

            async (lists: { deleteList: any[]; updateList: any[] }) => {
            if (!gridRef.current) return;

            if (lists.updateList.length === 0) {
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
                
                const updateList= lists.updateList;
                 
                
            

        axios
          .put(
            `${process.env.REACT_APP_BACKEND_IP}/api/todo`,
             updateList,
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

            handleSearch(); // 저장 후 최신 데이터 조회
            changeEditMode();// editMode 변경
                }
            });
         } catch(err) {
                console.error('Error saving data:', err);
                comAPIContext.showToast(
                    comAPIContext.$msg('message', 'save_fail', '저장이 실패했습니다.'),
                    'danger'
                );
                handleSearch();
                changeEditMode();
            } finally {
                comAPIContext.hideProgressBar();
            }
            },
            []
  );

    const handleDelete = useCallback((selectedRows: any[]) => {
        
        const selectedIds = selectedRows.map(row => row.id); //js 문법에 대한 이해가 부족함.
        console.log("handleDelete-selectedIds: "+ selectedIds)

        if (selectedIds.length === 0) {
            comAPIContext.showToast('삭제할 데이터가 없습니다.', 'dark');
            return;
        }
        const ids=selectedIds;

        // 서버에 삭제 요청
        axios.delete(`${process.env.REACT_APP_BACKEND_IP}/api/todo`
             ,{
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

    const handleUpdate=()=> {
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
          console.log("수정 버튼 클린 전 editMode:"+ editMode)
         changeEditMode();
         console.log("수정 버튼 클린 후 editMode:"+ editMode)

      
    }

    const changeEditMode=()=>{
            if(editMode==false){
            setEditMode(true);
            setCanDelete(true);
            setCanUpdate(true);
            setCheckBox(true);
            setCanCreate(false);
        } else{
            setEditMode(false);
            setCanDelete(false);
            setCanUpdate(false);
            setCheckBox(false);
            setCanCreate(true);
        }
    };
        
                
    const updateButton=useMemo(()=>{
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
        console.log("canCreate: "+canCreate)
        const createButton=useMemo(()=>(
       
            <>
                <ComButton
                    size="sm"
                    className="me-2"
                    onClick={openPopup}
                    disabled={!canCreate}
                >
                    {comAPIContext.$msg('label', 'add Todo', 'Todo 추가')}
                </ComButton>
            </>
         ),[openPopup,canCreate]);

        
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
            <div>
                <div>
                    <h1>안녕하세요</h1>
                    <button>추가</button>
                </div>
                <div>
                    <AgGridWrapper 
                        ref={gridRef} 
                        columnDefs={columnDefs} 
                        enableCheckbox={checkBox}
                        showButtonArea={true}
                        canCreate={false}
                        canDelete={canDelete}
                        canUpdate={canUpdate}          
                        useNoColumn={true}
                        onSave={handleSave}
                        onDelete={handleDelete}
                    >
                        {createButton}
                        {updateButton}
                    </AgGridWrapper>
                </div>

            </div>
        );

}

export default YoonTodo;
