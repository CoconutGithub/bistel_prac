import React, { useMemo } from 'react';
import { Button, Table, Row, Col } from 'react-bootstrap';

//##################################################################
// [추가] IProjectHumanResource 인터페이스를 파일 내에 직접 선언
//##################################################################
interface IProjectHumanResource {
  gridRowId: string;
  resourceAllocationId?: number;
  userId: string;
  roleId: number | null;
  plannedMm: number;
  actualMm: number;
  actualStartDate: string;
  actualEndDate: string;
  plannedStartDate: string;
  plannedEndDate: string;
  isCreated?: boolean;
  isUpdated?: boolean;
}

//##################################################################
// [추가] TS7053 오류 해결을 위한 타입 인터페이스
//##################################################################

/**
 * 피벗 테이블의 행(row) 데이터 타입
 * 'id', 'name', 'sum' 외에 '2025-01', '2025-02' 등 동적 문자열 키를 허용
 */
interface PivotDataRow {
  id: number | undefined;
  name: string;
  sum: number;
  [month: string]: number | string | undefined; // 문자열 인덱스 시그니처
}

/**
 * 피벗 테이블의 푸터(footer) 합계 데이터 타입
 * 'sum' 외에 '2025-01', '2025-02' 등 동적 문자열 키를 허용
 */
interface ColumnTotalData {
  sum: number;
  [month: string]: number; // 문자열 인덱스 시그니처
}


//##################################################################
// 1. 유틸리티 함수
//##################################################################

const getDaysBetween = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (start > end) return 0;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

const getMonthsArray = (startStr: string, endStr: string): string[] => {
  if (!startStr || !endStr) return [];

  const start = new Date(startStr);
  const end = new Date(endStr);
  const months: string[] = [];

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

  // [수정] ESLint 오류(prefer-const)를 무시하도록 주석 추가
  // 이 변수는 루프 내에서 'current.setMonth'로 '변경(mutate)'되므로 let이 맞습니다.
  // eslint-disable-next-line prefer-const
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    months.push(`${yyyy}-${mm}`);
    current.setMonth(current.getMonth() + 1);
  }
  return months;
};

const getOverlappingDays = (
  monthStr: string,
  resStartStr: string,
  resEndStr: string
): number => {
  if (!monthStr || !resStartStr || !resEndStr) return 0;
  const resStart = new Date(resStartStr);
  const resEnd = new Date(resEndStr);
  if (isNaN(resStart.getTime()) || isNaN(resEnd.getTime())) return 0;
  const [year, month] = monthStr.split('-').map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);
  const overlapStart = new Date(Math.max(monthStart.getTime(), resStart.getTime()));
  const overlapEnd = new Date(Math.min(monthEnd.getTime(), resEnd.getTime()));
  if (overlapStart > overlapEnd) {
    return 0;
  }
  const diffTime = Math.abs(overlapEnd.getTime() - overlapStart.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

const roundToOne = (num: number): number => {
  return Math.round(num * 10) / 10;
};


//##################################################################
// 2. 피벗 테이블 컴포넌트
//##################################################################

interface PivotGridProps {
  title: string;
  resources: IProjectHumanResource[];
  projectStartDate: string;
  projectEndDate: string;
  type: 'planned' | 'actual';
  onAdd: () => void;
  onDelete: (resourceId: number) => void;
}

const HumanResourcePivotGrid: React.FC<PivotGridProps> = ({
                                                            title,
                                                            resources,
                                                            projectStartDate,
                                                            projectEndDate,
                                                            type,
                                                            onAdd,
                                                            onDelete,
                                                          }) => {

  const monthColumns = useMemo(
    () => getMonthsArray(projectStartDate, projectEndDate),
    [projectStartDate, projectEndDate]
  );

  const pivotData = useMemo((): PivotDataRow[] => {
    const filteredResources = resources.filter(res => {
      const startDate = type === 'planned' ? res.plannedStartDate : res.actualStartDate;
      const endDate = type === 'planned' ? res.plannedEndDate : res.actualEndDate;
      return startDate && endDate;
    });

    return filteredResources.map((res) => {
      const totalMm = Number(type === 'planned' ? res.plannedMm : res.actualMm);
      const startDate = (type === 'planned' ? res.plannedStartDate : res.actualStartDate)!;
      const endDate = (type === 'planned' ? res.plannedEndDate : res.actualEndDate)!;

      const totalDays = getDaysBetween(startDate, endDate);
      const dailyMm = totalDays > 0 ? (totalMm / totalDays) : 0;

      const monthlyValues: { [month: string]: number } = {};
      let rowSum = 0;

      for (const month of monthColumns) {
        const overlappingDays = getOverlappingDays(month, startDate, endDate);
        const monthlyMm = dailyMm * overlappingDays;
        const roundedMm = roundToOne(monthlyMm);

        monthlyValues[month] = roundedMm;
        rowSum += roundedMm;
      }

      const rowData: PivotDataRow = {
        id: res.resourceAllocationId,
        name: res.userId,
        ...monthlyValues,
        sum: roundToOne(rowSum),
      };
      return rowData;
    });
  }, [resources, monthColumns, type]);

  const columnTotals = useMemo((): ColumnTotalData => {
    const totals: ColumnTotalData = { sum: 0 };
    let grandTotal = 0;

    for (const month of monthColumns) {
      const monthSum = pivotData.reduce((sum, row) => sum + (Number(row[month]) || 0), 0);
      totals[month] = roundToOne(monthSum);
    }

    grandTotal = pivotData.reduce((sum, row) => sum + (row.sum || 0), 0);
    totals.sum = roundToOne(grandTotal);

    return totals;
  }, [pivotData, monthColumns]);


  return (
    <div style={{ margin: '20px 0' }}>
      <Row className="mb-2 align-items-center">
        <Col>
          <h4>{title}</h4>
        </Col>
        <Col className="d-flex justify-content-end">
          <Button variant="outline-primary" size="sm" onClick={onAdd}>
            인력 추가
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive size="sm" className="pivot-table">
        <thead className="table-light">
        <tr>
          <th>Name \ Month</th>
          {monthColumns.map((month) => (
            <th key={month} style={{ minWidth: '40px', textAlign: 'center',fontWeight:'normal' }}>{month}</th>
          ))}
          <th style={{ minWidth: '20px', textAlign: 'center' }}>Sum</th>
          <th style={{ minWidth: '60px', textAlign: 'center' }}>Action</th>
        </tr>
        </thead>

        <tbody>
        {pivotData.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            {monthColumns.map((month) => (
              <td key={month} style={{ textAlign: 'center' }}>
                {Number(row[month]) > 0 ? row[month] : ''}
              </td>
            ))}
            <td style={{ textAlign: 'center' }}><strong>{row.sum > 0 ? row.sum : ''}</strong></td>
            <td style={{ textAlign: 'center' }}>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDelete(row.id!)}
              >
                삭제
              </Button>
            </td>
          </tr>
        ))}
        </tbody>

        <tfoot>
        <tr className="table-light">
          <td><strong>Total</strong></td>
          {monthColumns.map((month) => (
            <td key={month} style={{ textAlign: 'center' }}>
              <strong>{columnTotals[month] > 0 ? columnTotals[month] : ''}</strong>
            </td>
          ))}
          <td style={{ textAlign: 'center' }}><strong>{columnTotals.sum > 0 ? columnTotals.sum : ''}</strong></td>
          <td></td>
        </tr>
        </tfoot>
      </Table>
    </div>
  );
};

export default HumanResourcePivotGrid;