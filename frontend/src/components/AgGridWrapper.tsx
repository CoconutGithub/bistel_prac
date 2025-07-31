// src/components/AgGridWrapper.tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { myTheme } from '../theme';
import { ColDef, GridReadyEvent, CellValueChangedEvent } from 'ag-grid-community';

interface AgGridWrapperProps {
    columnDefs: ColDef[];
    rowData: any[];
    onGridReady?: (params: GridReadyEvent) => void;
    onCellValueChanged?: (event: CellValueChangedEvent) => void;
    onPaginationChanged?: (params: any) => void;


}

const AgGridWrapper = forwardRef<any, AgGridWrapperProps>(
    ({ columnDefs, rowData, onGridReady, onCellValueChanged, onPaginationChanged }, ref) => {
        const gridRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            exportToCsv: () => {
                gridRef.current?.api.exportDataAsCsv();
            },
            api: gridRef.current?.api,
            columnApi: gridRef.current?.columnApi
        }));

        return (
            <div style={{ height: '80%', width: '97%' }} className="ag-theme-alpine">
                <AgGridReact
                    ref={gridRef}
                    theme={myTheme}
                    columnDefs={columnDefs}
                    rowData={rowData}
                    headerHeight={50}
                    floatingFiltersHeight={40}
                    defaultColDef={{ sortable: true, filter: true, floatingFilter: true, resizable: true, editable: true }}
                    pagination={true}
                    paginationPageSize={20}
                    onGridReady={onGridReady}
                    onPaginationChanged={onPaginationChanged}
                    onCellValueChanged={onCellValueChanged}
                    enableCellSpan={true}
                />
            </div>
        );
    }
);
export default AgGridWrapper;