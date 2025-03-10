import React, {useState, useRef, useEffect, useContext, useCallback} from "react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import { useSelector } from "react-redux";
import axios from "axios";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import { RootState } from "~store/Store";
import { ComAPIContext } from "~components/ComAPIContext";

const columnDefs = [
    {field: "id", hide: true},
    {field: "title"},
    {field: "content"},
    {field: "notice_start"},
    {field: "notice_end"},
    {field: "file_id"},
    {field: "create_at"}
]
//gridRef 사용하여 데이터 띄움 굳. 해보자.
//인터페이스 만들어야겠네




//   axios
//     .post(
//         `${process.env.REACT_APP_BACKEND_IP}/biz/
//         //백앤드에 api 구현해보자~~
//     )

const YoonNotice: React.FC = () => {
    // const [colDefs, setColDefs] = useState();


      //=== 설정된 값 및 버튼 정보, 공통함수 가져옴-start ===
//   const comAPIContext = useContext(ComAPIContext);
//   const canCreate = useSelector(
//     (state: RootState) => state.auth.pageButtonAuth.canCreate
//   );
//   const canDelete = useSelector(
//     (state: RootState) => state.auth.pageButtonAuth.canDelete
//   );
//   const canUpdate = useSelector(
//     (state: RootState) => state.auth.pageButtonAuth.canUpdate
//   );
//   const canRead = useSelector(
//     (state: RootState) => state.auth.pageButtonAuth.canRead
//   );
  //=== 설정된 값 및 버튼 정보, 공통함수 가져옴-end ===

//   const langCode = useSelector((state: RootState) => state.auth.user.langCode);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const gridRef = useRef<AgGridWrapperHandle>(null);//으흠~ useRef를 어떻게 활용했는지 좀 더 확인하는걸로..
//   const userRegisterRef = useRef<any>(null);
//   const [dynamicColumnDefs, setDynamicColumnDefs] = useState(columnDefs);

    
    console.log("렌더링 횟수");
    return(
    <div>
        <h1>공지사항 페이지</h1>
        {/* <div style={{height: 500}}>
            <AgGridWrapper
                ref={gridRef}
                columnDefs={dynamicColumnDefs}
                rowSelection="multiple"
                enableCheckbox={true}
                //pagination={false}
                />
                 */}
                
        {/* </div> */}
    </div>
    );
};

export default YoonNotice;
