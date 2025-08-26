// src/pages/EquipmentCheckGrid.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import type { Line, Process, Equipment, SetValue } from '../data';

type ParamRow = {
    parameterCode: string;
    parameterName: string;
    unit: string | null;
    valueType: 'NUMBER' | 'TEXT';
    decimals: number | null;
    setValue: string | null;     // why: NUMBER/TEXT 통합 컬럼
    updatedBy: string | null;
    updatedAt: string | null;
};

export default function EquipmentCheckGrid() {
    const [factoryData, setFactoryData] = useState<Line[]>([]);
    const [selectedLineId, setSelectedLineId] = useState<number | null>(null);
    const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
    const [detailRowData, setDetailRowData] = useState<ParamRow[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/lines/factory-data', { headers: { Accept: 'application/json' } });
                if (!res.ok) throw new Error(`GET /lines/factory-data ${res.status}`);
                const data: Line[] = await res.json();
                setFactoryData(data);
            } catch (e) {
                console.error('[EquipmentCheckGrid] load failed', e);
            }
        })();
    }, []);

    const selectedLine: Line | null = useMemo(
        () => factoryData.find(l => (l as any).lineId === selectedLineId) ?? null,
        [factoryData, selectedLineId]
    );
    const processList: Process[] = useMemo(
        () => (selectedLine ? Array.from(selectedLine.processes) : []),
        [selectedLine]
    );
    const selectedProcess: Process | null = useMemo(
        () => processList.find(p => (p as any).processId === selectedProcessId) ?? null,
        [processList, selectedProcessId]
    );
    const equipmentList: Equipment[] = useMemo(
        () => (selectedProcess ? Array.from(selectedProcess.equipments) : []),
        [selectedProcess]
    );

    const toParamRow = (sv: SetValue): ParamRow => {
        // why: NUMBER/TEXT를 표시용 문자열 하나로 합치기
        const isNumber = (sv as any).valueType === 'NUMBER';
        const val = isNumber
            ? (sv as any).setValueNum != null ? String((sv as any).setValueNum) : null
            : (sv as any).setValueText ?? null;

        return {
            parameterCode: (sv as any).parameterCode,
            parameterName: (sv as any).parameterName,
            unit: (sv as any).unit ?? null,
            valueType: (sv as any).valueType,
            decimals: (sv as any).decimals ?? null,
            setValue: val,
            updatedBy: (sv as any).updatedBy ?? null,
            updatedAt: (sv as any).updatedAt ?? null,
        };
    };

    const toggleLine = useCallback((lineId: number) => {
        const next = selectedLineId === lineId ? null : lineId;
        setSelectedLineId(next);
        setSelectedProcessId(null);
        setSelectedEquipmentId(null);
        setDetailRowData([]);
    }, [selectedLineId]);

    const toggleProcess = useCallback((procId: number) => {
        const next = selectedProcessId === procId ? null : procId;
        setSelectedProcessId(next);
        setSelectedEquipmentId(null);
        setDetailRowData([]);
    }, [selectedProcessId]);

    const toggleEquipment = useCallback((eqpId: number) => {
        const next = selectedEquipmentId === eqpId ? null : eqpId;
        setSelectedEquipmentId(next);
        if (next == null) {
            setDetailRowData([]);
            return;
        }
        const eqp = equipmentList.find(e => (e as any).equipmentId === next) ?? null;
        const rows = eqp ? Array.from(eqp.setValues).map(toParamRow) : [];
        setDetailRowData(rows);
    }, [selectedEquipmentId, equipmentList]);

    const detailColumnDefs = useMemo<ColDef<ParamRow>[]>(() => [
        { headerName: 'Code', field: 'parameterCode', flex: 1 },
        { headerName: 'Name', field: 'parameterName', flex: 1.4 },
        { headerName: 'Unit', field: 'unit', width: 110 },
        { headerName: 'Type', field: 'valueType', width: 110 },
        { headerName: 'Decimals', field: 'decimals', width: 110 },
        { headerName: 'Set Value', field: 'setValue', flex: 1 },
        { headerName: 'Updated By', field: 'updatedBy', width: 140 },
        {
            headerName: 'Updated At',
            field: 'updatedAt',
            width: 180,
            valueFormatter: p => p.value ? new Date(p.value).toLocaleString() : '',
        },
    ], []);

    return (
        <div style={{ padding: 20, color: '#E4DAD1' }}>
            <h1>설비 파라미터 조회 (체크박스 선택)</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24}}>
                <section>
                    <h3 style={{ margin: '8px 0' }}>1) Line</h3>
                    <div style={{ display: 'grid', gap: 6 , backgroundColor:"#382017"}}>
                        {factoryData.map(line => (
                            <label key={(line as any).lineId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedLineId === (line as any).lineId}
                                    onChange={() => toggleLine((line as any).lineId)}
                                />
                                <span>{line.lineName}</span>
                            </label>
                        ))}
                        {factoryData.length === 0 && <span>불러오는 중…</span>}
                    </div>
                </section>

                <section>
                    <h3 style={{ margin: '8px 0' }}>2) Process</h3>
                    {selectedLine ? (
                        <div style={{ display: 'grid', gap: 6 , backgroundColor:"#382017"}}>
                            {processList.map(proc => (
                                <label key={(proc as any).processId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedProcessId === (proc as any).processId}
                                        onChange={() => toggleProcess((proc as any).processId)}
                                        disabled={!selectedLine}
                                    />
                                    <span>{proc.processName}</span>
                                </label>
                            ))}
                            {processList.length === 0 && <span>공정 없음</span>}
                        </div>
                    ) : (
                        <div style={{ opacity: 0.6 }}>라인을 먼저 선택하세요</div>
                    )}
                </section>

                <section>
                    <h3 style={{ margin: '8px 0' }}>3) Equipment</h3>
                    {selectedProcess ? (
                        <div style={{ display: 'grid', gap: 6 , backgroundColor:"#382017"}}>
                            {equipmentList.map(eqp => (
                                <label key={(eqp as any).equipmentId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedEquipmentId === (eqp as any).equipmentId}
                                        onChange={() => toggleEquipment((eqp as any).equipmentId)}
                                        disabled={!selectedProcess}
                                    />
                                    <span>{eqp.equipmentName}</span>
                                </label>
                            ))}
                            {equipmentList.length === 0 && <span>설비 없음</span>}
                        </div>
                    ) : (
                        <div style={{ opacity: 0.6 }}>프로세스를 먼저 선택하세요</div>
                    )}
                </section>
            </div>

            {selectedEquipmentId && (
                <div style={{ marginTop: 16 }}>
                    <h2>
                        {(equipmentList.find(e => (e as any).equipmentId === selectedEquipmentId)?.equipmentName) || '—'} : 파라미터
                    </h2>
                    <div className="ag-theme-alpine" style={{ height: 420, width: '100%' }}>
                        <AgGridReact<ParamRow>
                            rowData={detailRowData}
                            headerHeight={50}
                            rowHeight={35}
                            columnDefs={detailColumnDefs}
                            defaultColDef={{ flex: 1, sortable: true, filter: true, resizable: true }}
                            onGridReady={(e: GridReadyEvent) => e.api.sizeColumnsToFit()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
