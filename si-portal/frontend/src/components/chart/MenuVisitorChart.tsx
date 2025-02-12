// components/MenuVisitorChart.jsx
import React from 'react';
import ReactECharts from 'echarts-for-react';

// 데이터 타입 정의
interface MenuData {
    menu: string;
    visitors: number;
}

interface MenuVisitorChartProps {
    data: MenuData[];
}

const MenuVisitorChart: React.FC<MenuVisitorChartProps> = ({ data }) => {
    // ECharts 옵션 설정
    const options = {
        title: {
            text: '메뉴별 방문자 수',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
        },
        xAxis: {
            type: 'category',
            data: data.map((item : any) => item.menu),  // 메뉴 이름 리스트
            axisLabel: {
                rotate: 45,  // 라벨이 겹치지 않도록 회전
            },
        },
        yAxis: {
            type: 'value',
            name: '방문자 수',
        },
        series: [
            {
                name: '방문자 수',
                type: 'bar',
                data: data.map((item) => item.visitors),  // 방문자 수 리스트
                color: '#5470c6',  // 막대 색상
            },
        ],
    };

    return <ReactECharts option={options} style={{ height: '300px', width: '100%' }} />;
};

export default MenuVisitorChart;
