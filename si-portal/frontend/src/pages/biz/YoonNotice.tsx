import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import { RootState } from '~store/Store';
import { ComAPIContext } from '~components/ComAPIContext';
import { cachedAuthToken } from '~store/AuthSlice';

const columnDefs = [
  { field: 'gridRowId', headerName: 'gridRowId', editable: false, hide: true},
  { field: 'id', hide: true },
  { field: 'title', editable: true },
  { field: 'content', editable: true },
  { field: 'noticeStart', editable: true },
  { field: 'noticeEnd', editable: true },
  { field: 'fileId', editable: true },
  { field: 'createdAt' },
];

const roleKind: any = null;
//gridRef 사용하여 데이터 띄움 굳. 해보자.
//인터페이스 만들어야겠네

//   axios
//     .post(
//         `${process.env.REACT_APP_BACKEND_IP}/biz/
//         //백앤드에 api 구현해보자~~
//     )

const YoonNotice: React.FC = () => {
  // const [colDefs, setColDefs] = useState();

  // === 설정된 값 및 버튼 정보, 공통함수 가져옴-start ===
  const comAPIContext = useContext(ComAPIContext);
  const canCreate = useSelector(
    (state: RootState) => state.auth.pageButtonAuth.canCreate
  );
  const canDelete = useSelector(
    (state: RootState) => state.auth.pageButtonAuth.canDelete
  );
  const canUpdate = useSelector(
    (state: RootState) => state.auth.pageButtonAuth.canUpdate
  );
  const canRead = useSelector(
    (state: RootState) => state.auth.pageButtonAuth.canRead
  );
  //=== 설정된 값 및 버튼 정보, 공통함수 가져옴-end ===

  const langCode = useSelector((state: RootState) => state.auth.user.langCode);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<AgGridWrapperHandle>(null); //useRef를 어떻게 활용했는지 좀 더 확인하는걸로..
  const userRegisterRef = useRef<any>(null);
  const [dynamicColumnDefs, setDynamicColumnDefs] = useState(columnDefs);
  //이건 아마도 화면에서 데이터 수정이 가능하게 하기 위함으로 보인다.

  const handleSave = useCallback(
    (lists: { deleteList: any[]; updateList: any[] }) => {
      if (!gridRef.current) return;

      if (lists.deleteList.length === 0 && lists.updateList.length === 0) {
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
        // console.log("1.update 행들:", lists);
        // console.log("2.delete 행들:", lists);

        if (lists.updateList.length !== 0) {
          if (roleKind !== null) {
            lists.updateList.forEach((e) => {
              const roleData: any = roleKind.find(
                (r: any) => r.roleName === e.roleName
              );
              e.roleId = roleData.roleId;
            });
          }
        }

        // 전송 데이터 구성
        const payload = {
          updateList: lists.updateList,
          deleteList: lists.deleteList,
        };

        const { deleteList } = payload; //deleteList를 담은 객체 생성 <-

        console.log('deleteList 구조분해' + deleteList);
        console.log('deleteList 구조분해' + deleteList.at(0));
        console.log('deleteList' + payload.deleteList);
        // const noticeIds = payload.deleteList.map(item => item.id);//여기서 문제가 있어서 아래도 보이지 않았던 것 같다.
        // console.log("아이디 배열: "+noticeIds);

        //noticeIds.forEach(id => {
        axios
          .post(
            `${process.env.REACT_APP_BACKEND_IP}/biz/yoon-notice`,
            //deleteList,
            payload,
            {
              headers: { Authorization: `Bearer ${cachedAuthToken}` },
            }
          )
          .then((response) => {
            //console.log(`Deleted notice with ID: ${id}`, response);
            handleSearch(); // 저장 후 최신 데이터 조회
          })
          .catch((error) => {
            //console.error(`Error deleting notice with ID: ${id}`, error);
          });

        //});//gpt 코드
      } catch (err) {
        console.error('Error saving data:', err);
        comAPIContext.showToast(
          comAPIContext.$msg('message', 'save_fail', '저장이 실패했습니다.'),
          'danger'
        );
      } finally {
        comAPIContext.hideProgressBar();
      }
    },
    []
  );

  const handleSearch = () => {
    comAPIContext.showProgressBar();
    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/biz/yoon-notice`, {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
        //params: { userName: inputRef.current?.value || "" },
      })
      .then((res) => {
        console.log('응답 데이터:', res.data); // 응답 데이터 콘솔 출력

        if (gridRef.current) {
          gridRef.current.setRowData(res.data); // 데이터를 AgGridWrapper에 설정
        }
        comAPIContext.hideProgressBar();
        comAPIContext.showToast(
          comAPIContext.$msg(
            'message',
            'search_complete',
            '조회가 완료됐습니다.'
          ),
          'success'
        );
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        comAPIContext.showToast('Error User Search: ' + err, 'danger');
      })
      .finally(() => {
        comAPIContext.hideProgressBar();
      });
  };

  //페이지 열 때 리스트 조회
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_IP}/biz/yoon-notice`, {
        headers: { Authorization: `Bearer ${cachedAuthToken}` },
      })
      .then((res) => {
        console.log('응답 데이터', res.data);

        if (gridRef.current) {
          gridRef.current.setRowData(res.data);
        }
      });
  }, []);

  const handleExcel = () => {
    {
      axios
        .get(`${process.env.REACT_APP_BACKEND_IP}/biz/yoon-notice/excel`, {
          params: { id: 1 },
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        })
        .then((res) => {
          console.log('응답 데이터', res.data);

          if (gridRef.current) {
            gridRef.current.setRowData(res.data);
          }
        });
    }
  };

  console.log('렌더링 횟수');
  return (
    <div>
      <h1>공지사항 페이지</h1>
      <div className="search_btn">
        <button onClick={handleSearch}>
          {comAPIContext.$msg('label', 'search', '검색')}
        </button>
        <button onClick={handleExcel}>Excel</button>
      </div>
      <div style={{ height: 500 }}>
        <AgGridWrapper
          ref={gridRef}
          columnDefs={dynamicColumnDefs}
          rowSelection="multiple"
          canDelete={canDelete} // 삭제 버튼이 활성화됨.
          canUpdate={canUpdate} // 저장 버튼이 활성화됨
          // enableCheckbox={true}
          onSave={handleSave} // 저장 버튼 동작
          //pagination={false}
        />
      </div>
    </div>
  );
};

export default YoonNotice;



