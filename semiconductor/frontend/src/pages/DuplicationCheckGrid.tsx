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
    setValue: string | null;     // NUMBER/TEXT 통합 표기
    updatedBy: string | null;
    updatedAt: string | null;
};

export default function EquipmentCheckGrid() {
    const [factoryData, setFactoryData] = useState<Line[]>([]);
    const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);
    const [selectedProcessIds, setSelectedProcessIds] = useState<number[]>([]);
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);

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

    // 유틸
    const toggleId = (arr: number[], id: number) =>
        arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];

    // 선택된 라인 → 공정 목록(중복 제거)
    const processList: Process[] = useMemo(() => {
        const map = new Map<number, Process>();
        factoryData.forEach((l: any) => {
            if (!selectedLineIds.includes(l.lineId)) return;
            Array.from(l.processes ?? []).forEach((p: any) => {
                map.set(p.processId, p as Process);
            });
        });
        return Array.from(map.values());
    }, [factoryData, selectedLineIds]);

    // 선택된 공정 → 설비 목록(중복 제거)
    const equipmentList: Equipment[] = useMemo(() => {
        const map = new Map<number, Equipment>();
        processList.forEach((p: any) => {
            if (!selectedProcessIds.includes(p.processId)) return;
            Array.from(p.equipments ?? []).forEach((e: any) => {
                map.set(e.equipmentId, e as Equipment);
            });
        });
        return Array.from(map.values());
    }, [processList, selectedProcessIds]);

    // 설비ID → 설비 조회 맵
    const equipmentById = useMemo(() => {
        const m = new Map<number, Equipment>();
        equipmentList.forEach(e => m.set((e as any).equipmentId, e));
        return m;
    }, [equipmentList]);

    // SetValue → ParamRow 변환
    const toParamRow = (sv: SetValue): ParamRow => {
        const isNumber = (sv as any).valueType === 'NUMBER';
        const val = isNumber
            ? ((sv as any).setValueNum != null ? String((sv as any).setValueNum) : null)
            : ((sv as any).setValueText ?? null);
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

    // ✅ 선택된 모든 설비의 SetValue를 합쳐서 표시
    const detailRowData: ParamRow[] = useMemo(() => {
        const rows: ParamRow[] = [];
        selectedEquipmentIds.forEach((id) => {
            const eqp = equipmentById.get(id);
            if (!eqp) return;

            // 핵심: SetValue[]로 명시 캐스팅하여 unknown[] 문제 제거
            const svs = (Array.isArray((eqp as any).setValues)
                ? (eqp as any).setValues
                : Array.from((eqp as any).setValues ?? [])) as SetValue[];

            const list = svs.map((sv) => toParamRow(sv)); // sv는 이제 SetValue
            rows.push(...list);
        });
        return rows;
    }, [selectedEquipmentIds, equipmentById]);


    // 토글 핸들러들 (하위 선택 정리 포함)
    const onToggleLine = useCallback((lineId: number) => {
        setSelectedLineIds(prev => {
            const next = toggleId(prev, lineId);

            // 해제된 라인의 공정/설비 선택 정리
            if (!next.includes(lineId)) {
                const line = factoryData.find((l: any) => l.lineId === lineId) as any;
                const procIdsToRemove = new Set<number>(
                    Array.from(line?.processes ?? []).map((p: any) => p.processId)
                );
                setSelectedProcessIds(prevP => prevP.filter(pid => !procIdsToRemove.has(pid)));

                // 해당 공정들의 설비도 제거
                const eqpIdsToRemove = new Set<number>();
                Array.from(line?.processes ?? []).forEach((p: any) => {
                    Array.from(p?.equipments ?? []).forEach((e: any) => eqpIdsToRemove.add(e.equipmentId));
                });
                setSelectedEquipmentIds(prevE => prevE.filter(eid => !eqpIdsToRemove.has(eid)));
            }

            return next;
        });
    }, [factoryData]);

    const onToggleProcess = useCallback((procId: number) => {
        setSelectedProcessIds(prev => {
            const next = toggleId(prev, procId);

            // 해제된 공정의 설비 선택 정리
            if (!next.includes(procId)) {
                // processList는 모든 선택 라인들의 공정 유니온이므로 여기에서 해당 공정 찾기
                const proc = processList.find((p: any) => p.processId === procId) as any;
                const eqpIdsToRemove = new Set<number>(
                    Array.from(proc?.equipments ?? []).map((e: any) => e.equipmentId)
                );
                setSelectedEquipmentIds(prevE => prevE.filter(eid => !eqpIdsToRemove.has(eid)));
            }

            return next;
        });
    }, [processList]);

    const onToggleEquipment = useCallback((eqpId: number) => {
        setSelectedEquipmentIds(prev => toggleId(prev, eqpId));
    }, []);

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
            <h1>설비 파라미터 조회 (체크박스 선택 · 멀티)</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24}}>
                {/* Lines */}
                <section>
                    <h3 style={{ margin: '8px 0' }}>1) Line</h3>
                    <div style={{ display: 'grid', gap: 6, backgroundColor:"#382017", padding: 8 }}>
                        {factoryData.map((line: any) => (
                            <label key={line.lineId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedLineIds.includes(line.lineId)}
                                    onChange={() => onToggleLine(line.lineId)}
                                />
                                <span>{line.lineName}</span>
                            </label>
                        ))}
                        {factoryData.length === 0 && <span>불러오는 중…</span>}
                    </div>
                </section>

                {/* Processes */}
                <section>
                    <h3 style={{ margin: '8px 0' }}>2) Process</h3>
                    {selectedLineIds.length > 0 ? (
                        <div style={{ display: 'grid', gap: 6, backgroundColor:"#382017", padding: 8 }}>
                            {processList.map((proc: any) => (
                                <label key={proc.processId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedProcessIds.includes(proc.processId)}
                                        onChange={() => onToggleProcess(proc.processId)}
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

                {/* Equipments */}
                <section>
                    <h3 style={{ margin: '8px 0' }}>3) Equipment</h3>
                    {selectedProcessIds.length > 0 ? (
                        <div style={{ display: 'grid', gap: 6, backgroundColor:"#382017", padding: 8 }}>
                            {equipmentList.map((eqp: any) => (
                                <label key={eqp.equipmentId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedEquipmentIds.includes(eqp.equipmentId)}
                                        onChange={() => onToggleEquipment(eqp.equipmentId)}
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

            {selectedEquipmentIds.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <h2>선택 설비 {selectedEquipmentIds.length}개 : 파라미터</h2>
                    <div className="ag-theme-alpine" style={{ height: 780, width: '100%' }}>
                        <AgGridReact<ParamRow>
                            pagination={true}
                            paginationPageSize={20}
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
