import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
// 🌟 ICellEditorParams 타입을 import 합니다.
import { ColDef, CellValueChangedEvent, ICellEditorParams } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { Line, Process, Equipment, SetValue } from '../data';

interface GridRow {
    line?: Line;
    process?: Process;
    equipment?: Equipment;
}

const EquipmentGrid: React.FC = () => {
    const [factoryData, setFactoryData] = useState<Line[]>([]);
    const [rowData, setRowData] = useState<GridRow[]>([{}]);
    const [detailRowData, setDetailRowData] = useState<SetValue[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/lines/factory-data');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Line[] = await response.json();
                setFactoryData(data);
            } catch (error) {
                console.error("Failed to fetch factory data:", error);
            }
        };
        fetchData();
    }, []);

    const columnDefs = useMemo<ColDef<GridRow>[]>(() => [ // GridRow 타입을 명시해주는 것이 좋습니다.
        {
            headerName: 'Line',
            field: 'line.lineName',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {
                values: factoryData.map(line => line.lineName),
            },
            valueGetter: params => params.data?.line?.lineName,
        },
        {
            headerName: 'Process',
            field: 'process.processName',
            cellEditor: 'agSelectCellEditor',
            // 🌟 params의 타입을 any 대신 ICellEditorParams<GridRow>로 정확하게 지정합니다.
            cellEditorParams: (params: ICellEditorParams<GridRow>) => ({
                values: params.data?.line ? Array.from(params.data.line.processes).map(p => p.processName) : [],
            }),
            valueGetter: params => params.data?.process?.processName,
        },
        {
            headerName: 'Equipment',
            field: 'equipment.equipmentName',
            cellEditor: 'agSelectCellEditor',
            // 🌟 params의 타입을 any 대신 ICellEditorParams<GridRow>로 정확하게 지정합니다.
            cellEditorParams: (params: ICellEditorParams<GridRow>) => ({
                values: params.data?.process ? Array.from(params.data.process.equipments).map(e => e.equipmentName) : [],
            }),
            valueGetter: params => params.data?.equipment?.equipmentName,
        },
    ], [factoryData]);

    const onCellValueChanged = useCallback((event: CellValueChangedEvent<GridRow>) => {
        const { colDef, newValue, node, data } = event;
        const field = colDef.field;

        if (node.rowIndex == null || !data) return;

        const updatedRow: GridRow = { ...data };

        if (field === 'line.lineName') {
            const selectedLine = factoryData.find(line => line.lineName === newValue);
            updatedRow.line = selectedLine;
            updatedRow.process = undefined;
            updatedRow.equipment = undefined;
            setDetailRowData([]);
        }
        else if (field === 'process.processName') {
            const selectedProcess = updatedRow.line?.processes.find(
                (p: Process) => p.processName === newValue
            );
            updatedRow.process = selectedProcess;
            updatedRow.equipment = undefined;
            setDetailRowData([]);
        }
        else if (field === 'equipment.equipmentName') {
            const selectedEquipment = updatedRow.process?.equipments.find(
                (e: Equipment) => e.equipmentName === newValue
            );
            updatedRow.equipment = selectedEquipment;
            setDetailRowData(selectedEquipment ? Array.from(selectedEquipment.setValues) : []);
        }

        setRowData(prevRowData => {
            const newRowData = [...prevRowData];
            newRowData[node.rowIndex!] = updatedRow;
            return newRowData;
        });

    }, [factoryData]);

    const detailColumnDefs = useMemo<ColDef[]>(() => [
        { headerName: 'Parameter Name', field: 'parameterName', flex: 2 },
        { headerName: 'Parameter Code', field: 'parameterCode', flex: 1 },
        {
            headerName: 'Set Value',
            field: 'value',
            flex: 1,
            valueGetter: params => params.data.valueType === 'NUMBER' ? params.data.setValueNum : params.data.setValueText,
        },
        { headerName: 'Unit', field: 'unit', flex: 1 },
        { headerName: 'Last Updated', field: 'updatedAt', flex: 2 },
    ], []);

    return (
        <div style={{ padding: '20px' ,color:"#E4DAD1"}}>
            <h1>설비 파라미터 조회</h1>

            <h2>설비 선택</h2>
            <div className="ag-theme-alpine" style={{ height: 200, width: '100%' }}>
                <AgGridReact<GridRow> // GridRow 타입을 명시해주는 것이 좋습니다.
                    rowData={rowData}
                    headerHeight={50}
                    rowHeight={40}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        editable: true,
                        flex: 1,
                    }}
                    singleClickEdit={true}
                    onCellValueChanged={onCellValueChanged}
                />
            </div>
            {detailRowData.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                    <h2>{rowData.find(row => row.equipment)?.equipment?.equipmentName} : 파라미터</h2>
                    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
                        <AgGridReact
                            rowData={detailRowData}
                            headerHeight={50}
                            rowHeight={35}
                            columnDefs={detailColumnDefs}
                            defaultColDef={{
                                flex: 1,
                                sortable: true,
                                filter: true,
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentGrid;