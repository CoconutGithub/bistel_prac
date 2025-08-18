import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ColDef } from 'ag-grid-community';

// 직접 AgGridReact를 사용하는 대신, 직접 만드신 Wrapper 컴포넌트를 임포트합니다.
import AgGridWrapper from '../components/AgGridWrapper';


// API 응답 데이터의 타입을 정의합니다.
interface LineData {
    id: number;
    lineName: string;
    lineLocation: string;
    lineUnit: string;
}

const LineGrid: React.FC = () => {
    // 1. 컬럼 정의 (이 부분은 이전과 동일합니다)
    const [colDefs] = useState<ColDef[]>([
        { field: 'id', headerName: 'ID', width: 80, editable: false }, // ID는 보통 수정하지 않으므로 editable: false 추가
        { field: 'lineName', headerName: '라인명', flex: 1 },
        { field: 'lineUnit', headerName: '라인 유닛', flex: 1 },
        { field: 'lineLocation', headerName: '라인 위치', flex: 2 }
    ]);

    // 2. 그리드에 표시될 데이터 (이 부분도 이전과 동일합니다)
    const [rowData, setRowData] = useState<LineData[]>([]);

    // 3. 컴포넌트가 처음 마운트될 때 API를 호출하여 데이터 가져오기 (이 부분도 이전과 동일합니다)
    useEffect(() => {
        axios.get<LineData[]>('/lines')
            .then(response => {
                setRowData(response.data);
            })
            .catch(error => {
                console.error("라인 데이터를 가져오는 중 오류가 발생했습니다.", error);
            });
    }, []);


    // 4. 렌더링: AgGridReact 대신 AgGridWrapper를 사용합니다.
    return (
        <div style={{ height: '500px', width: '100%' }}>
            <AgGridWrapper
                columnDefs={colDefs}
                rowData={rowData}
                // 필요하다면 여기에 onCellValueChanged 같은 이벤트 핸들러를 전달할 수 있습니다.
                // onCellValueChanged={(event) => console.log('Cell value changed:', event)}
            />
        </div>
    );
};

export default LineGrid;