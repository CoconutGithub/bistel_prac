import React from 'react';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';

interface AgGridTheme {
    getCSSVariables: () => React.CSSProperties;
}

// 🌟 'theme' prop의 이름을 'dsTheme'으로 변경합니다.
interface StyledAgGridProps extends AgGridReactProps {
    dsTheme: AgGridTheme;
    height?: string | number;
    width?: string | number;
}

// 🌟 props에서 theme 대신 dsTheme을 받도록 수정합니다.
const StyledAgGrid = ({ dsTheme, height = '100%', width = '100%', ...restProps }: StyledAgGridProps) => {
    // 🌟 dsTheme을 사용하여 스타일을 추출합니다.
    const themeStyles = dsTheme.getCSSVariables();
    const themeClassName = 'ag-theme-quartz';

    return (
        <div
            className={themeClassName}
            style={{ height, width, ...themeStyles }}
        >
            <AgGridReact
                {...restProps}
            />
        </div>
    );
};

export default StyledAgGrid;