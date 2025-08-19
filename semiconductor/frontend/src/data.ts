// 데이터베이스 스키마를 기반으로 한 타입 정의
export interface SetValue {
    parameterId: number;
    parameterCode: string;
    parameterName: string;
    unit: string | null;
    valueType: 'NUMBER' | 'TEXT';
    decimals: number | null;
    setValueNum: number | null;
    setValueText: string | null;
    updatedAt: string;
}

export interface Equipment {
    equipmentId: number;
    equipmentName: string;
    setValues: SetValue[];
}

export interface Process {
    processId: number;
    processName: string;
    equipments: Equipment[];
}

export interface Line {
    lineId: number;
    lineName: string;
    processes: Process[];
}

// 백엔드에서 내려올 것으로 예상되는 전체 데이터 구조
// export const mockFactoryData: Line[] = [
//     {
//         lineId: 1,
//         lineName: 'LINE_A',
//         processes: [
//             {
//                 processId: 101,
//                 processName: 'PHOTO',
//                 equipments: [
//                     {
//                         equipmentId: 1001,
//                         equipmentName: 'LINE_A_PHOTO_0001',
//                         setValues: [
//                             { parameterId: 1, parameterCode: 'TEMP_C', parameterName: 'Temperature', unit: '°C', valueType: 'NUMBER', decimals: 2, setValueNum: 25.5, setValueText: null, updatedAt: '2025-08-19T10:00:00Z' },
//                             { parameterId: 2, parameterCode: 'PRESSURE', parameterName: 'Pressure', unit: 'Pa', valueType: 'NUMBER', decimals: 0, setValueNum: 1013, setValueText: null, updatedAt: '2025-08-19T10:00:00Z' },
//                         ],
//                     },
//                     {
//                         equipmentId: 1002,
//                         equipmentName: 'LINE_A_PHOTO_0002',
//                         setValues: [
//                             { parameterId: 1, parameterCode: 'TEMP_C', parameterName: 'Temperature', unit: '°C', valueType: 'NUMBER', decimals: 2, setValueNum: 26.1, setValueText: null, updatedAt: '2025-08-19T10:00:00Z' },
//                             { parameterId: 3, parameterCode: 'RECIPE_NAME', parameterName: 'Recipe Name', unit: null, valueType: 'TEXT', decimals: null, setValueNum: null, setValueText: 'RECIPE_ABC_V1', updatedAt: '2025-08-19T10:00:00Z' },
//                         ],
//                     },
//                 ],
//             },
//             {
//                 processId: 102,
//                 processName: 'ETCH',
//                 equipments: [
//                     {
//                         equipmentId: 2001,
//                         equipmentName: 'LINE_A_ETCH_0001',
//                         setValues: [
//                             { parameterId: 4, parameterCode: 'GAS_FLOW', parameterName: 'Gas Flow', unit: 'sccm', valueType: 'NUMBER', decimals: 1, setValueNum: 50.2, setValueText: null, updatedAt: '2025-08-19T11:00:00Z' },
//                             { parameterId: 5, parameterCode: 'POWER', parameterName: 'RF Power', unit: 'W', valueType: 'NUMBER', decimals: 0, setValueNum: 3000, setValueText: null, updatedAt: '2025-08-19T11:00:00Z' },
//                         ],
//                     },
//                 ],
//             },
//         ],
//     },
//     {
//         lineId: 2,
//         lineName: 'LINE_B',
//         processes: [
//             {
//                 processId: 201,
//                 processName: 'DEPOSITION',
//                 equipments: [
//                     {
//                         equipmentId: 3001,
//                         equipmentName: 'LINE_B_DEPOSITION_0001',
//                         setValues: [
//                             { parameterId: 1, parameterCode: 'TEMP_C', parameterName: 'Temperature', unit: '°C', valueType: 'NUMBER', decimals: 2, setValueNum: 800.0, setValueText: null, updatedAt: '2025-08-19T12:00:00Z' },
//                         ],
//                     },
//                 ],
//             },
//         ]
//     }
// ];