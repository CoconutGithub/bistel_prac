import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { cachedAuthToken } from '~store/AuthSlice';
import React, {useState, useRef, useEffect, useCallback, useContext} from "react"; // React는 default export, useState는 기본 export 겠군
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import axios from 'axios';
import ComButton from '../portal/buttons/ComButton';
import { ComAPIContext } from '~components/ComAPIContext';





const YoonTodo=()=>{

    const [canCreate, setCanCreate]= useState(true)
    const gridRef = useRef<AgGridWrapperHandle>(null);
    const comAPIContext = useContext(ComAPIContext);

        const [columnDefs, setColumnDefs] = useState(
        [   
            {field : 'id' , hide: true}, 
            {field : 'todoType' }, 
            {field : 'worker' },
            {field : 'title' },
            {field : 'content' },
            {field : 'dueDate' },
            {field : 'progressStatus' }
        ]
); 

                
        const openPopup=()=>{
            
        }

        const handleSearch=()=>{
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
        
        const onSave = useCallback(

            

            async (lists: { deleteList: any[]; updateList: any[] }) => {
            if (!gridRef.current) return;

            // if (lists.deleteList.length === 0 && lists.updateList.length === 0) {
            //     comAPIContext.showToast(
            //     comAPIContext.$msg(
            //         'message',
            //         'no_save_data',
            //         '저장할 데이터가 없습니다.'
            //     ),
            //     'dark'
            //     );
            //     return;
            // }

            try {

                comAPIContext.showProgressBar(); 
                
                
                const payload = {
                  updateList: lists.updateList,
                  deleteList: lists.deleteList
                };

        axios
          .put(
            `${process.env.REACT_APP_BACKEND_IP}/api/todo`,
            payload,
            {
              headers: { Authorization: `Bearer ${cachedAuthToken}` },
            }
          )
          .then((res) => {
            if (res.data.messageCode === 'success') {
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
                }
            });
         } catch(err) {
                console.error('Error saving data:', err);
                comAPIContext.showToast(
                    comAPIContext.$msg('message', 'save_fail', '저장이 실패했습니다.'),
                    'danger'
                );
                handleSearch();
            } finally {
                comAPIContext.hideProgressBar();
            }
            },
            []
  );
        
                
        
        

    const createButton=useCallback(()=>{
        return(
            <>
                <ComButton
                    size="sm"
                    className="me-2"
                    onClick={openPopup}
                    disabled={!canCreate}
                >

                </ComButton>
            </>
        );
    },[])
        
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
                        enableCheckbox={false}
                        showButtonArea={true}
                        canCreate={true}
                        canDelete={true}
                        canUpdate={true}          
                        useNoColumn={true}
                    />
                </div>

            </div>
        );

}

export default YoonTodo;
