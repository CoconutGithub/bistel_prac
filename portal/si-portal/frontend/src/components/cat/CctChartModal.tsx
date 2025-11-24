import {CorporateCardTransactionData} from "~types/CorporateCardTransactionData";
import {Modal} from "react-bootstrap";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import React, {useEffect} from "react";
import * as echarts from 'echarts';

interface CctChartModalProps{
    show: boolean;
    onHide: () => void;
    onSelect: () => void;
    startDate: string;
    endDate: string;
    data?: CorporateCardTransactionData[] | null;
}

const CctChartModal: React.FC<CctChartModalProps> = ({
     show,
     onHide,
     onSelect,
    startDate,
    endDate,
     data,
}) =>{

    const generateDateRange = (start: string, end: string): string[] => {
        const result: string[] = [];

        // eslint-disable-next-line prefer-const
        let current = new Date(start);
        const last = new Date(end);

        while (current <= last) {
            const yyyy = current.getFullYear();
            const mm = String(current.getMonth() + 1).padStart(2, '0');
            const dd = String(current.getDate()).padStart(2, '0');

            result.push(`${yyyy}-${mm}-${dd}`);

            current.setDate(current.getDate() + 1);
        }

        return result;
    };


    const transformChartData = (data?: CorporateCardTransactionData[] | null) => {
        if (!data) return { xAxis: [], legend: [], series: [] };

        // 1. 날짜 정렬
        const dateSet = generateDateRange(startDate, endDate)

        // 2. 카테고리 목록 추출
        const categorySet = Array.from(
            new Set(data.map((d) => d.merchantCategory))
        );

        // 3. { category: { date: sumAmount } } 형태로 그룹화
        const categoryMap: Record<string, Record<string, number>> = {};

        categorySet.forEach((cat) => {
            categoryMap[cat] = {};
            dateSet.forEach((date) => {
                categoryMap[cat][date] = 0; // 기본값 0
            });
        });

        data.forEach((item) => {
            const date = item.approvalDate.slice(0, 10);

            console.log("approvalDate: {}, date: {}", item.approvalDate, date)

            if (categoryMap[item.merchantCategory][date] !== undefined) {
                categoryMap[item.merchantCategory][date] += item.transactionAmount;
            }
        });

        // 4. ECharts series 형태로 변환
        const series = categorySet.map((cat) => ({
            name: cat,
            type: "line",
            stack: "Total",
            data: dateSet.map((date) => categoryMap[cat][date]),
        }));

        return {
            xAxis: dateSet,
            legend: categorySet,
            series,
        };
    };



    useEffect(() => {
        if (!show) return; // 모달 열릴 때만 실행

        const chartDom = document.getElementById("main");
        if (!chartDom) return;

        const { xAxis, legend, series } = transformChartData(data);

        const option = {
            title: { text: "법인카드 사용내역" },
            tooltip: { trigger: "axis" },
            legend: { data: legend },
            xAxis: { type: "category", boundaryGap: false, data: xAxis },
            yAxis: { type: "value" },
            series: series,
        };

        const myChart = echarts.init(chartDom);
        myChart.setOption(option);

        return () => {
            myChart.dispose();
        };
    }, [show]);


    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size={"xl"}
        >
            <Modal.Header closeButton>
                <Modal.Title>법인카드 사용내역 차트</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div id="main" style={{ width: "100%", height: "400px" }}></div>
            </Modal.Body>
        </Modal>
    );
};

export default CctChartModal;