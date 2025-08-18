import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    ColDef,
    GridReadyEvent,
    CellValueChangedEvent,
    GridApi,
} from 'ag-grid-community';
import { myTheme } from '../theme';

interface AgGridWrapperProps {
    columnDefs: ColDef[];
    rowData: any[];
    onGridReady?: (params: GridReadyEvent) => void;
    onCellValueChanged?: (event: CellValueChangedEvent) => void;
    onPaginationChanged?: (params: any) => void;
    onFilterChanged?: () => void;
    onSortChanged?: () => void;
}

const AgGridWrapper = forwardRef<any, AgGridWrapperProps>(({
                                                               columnDefs,
                                                               rowData,
                                                               onGridReady,
                                                               onCellValueChanged,
                                                               onPaginationChanged,
                                                               onFilterChanged,
                                                               onSortChanged
                                                           }, ref) => {
    const gridRef = useRef<AgGridReact>(null);
    const apiRef = useRef<GridApi | null>(null);

    useImperativeHandle(ref, () => ({
        exportToCsv: () => apiRef.current?.exportDataAsCsv(),
        getFilterModel: () => apiRef.current?.getFilterModel(),
        setFilterModel: (model: any) => apiRef.current?.setFilterModel(model),
        getSortModel: () => {
            const columnState = apiRef.current?.getColumnState() || [];
            return columnState
                .filter(col => col.sort != null)
                .map(col => ({
                    colId: col.colId,
                    sort: col.sort,
                }));
        },
        setSortModel: (sortModel: any[]) => {
            const current = apiRef.current?.getColumnState() || [];
            const newState = current.map(col => {
                const found = sortModel.find(s => s.colId === col.colId);
                return {
                    ...col,
                    sort: found?.sort || null,
                    sortIndex: found ? sortModel.indexOf(found) : null,
                };
            });
            apiRef.current?.applyColumnState({ state: newState, applyOrder: true });
        }
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
                defaultColDef={{
                    sortable: true,
                    filter: true,
                    floatingFilter: true,
                    resizable: true,
                    editable: true,
                }}
                pagination={true}
                paginationPageSize={20}
                onGridReady={(params) => {
                    apiRef.current = params.api;
                    onGridReady?.(params);
                }}
                onPaginationChanged={onPaginationChanged}
                onCellValueChanged={onCellValueChanged}
                onFilterChanged={onFilterChanged}
                onSortChanged={onSortChanged}
            />
        </div>
    );
});

export default AgGridWrapper;