import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
// 1. ICellEditorComp 대신, props의 타입인 ICellEditorParams를 import 합니다.
import { ICellEditorParams } from 'ag-grid-community';

// 2. ICellEditorParams를 확장하여 props 타입을 정의합니다.
interface ICustomSelectCellEditorProps extends ICellEditorParams {
    values: string[];
}

// forwardRef와 useImperativeHandle를 사용하여 AG-Grid에 필요한 메소드를 노출합니다.
export default forwardRef((props: ICustomSelectCellEditorProps, ref) => {

    // 이제 props.value는 ICellEditorParams로부터 정상적으로 상속받아 에러가 발생하지 않습니다.
    const getInitialValue = () => {
        return props.value;
    };

    const [value, setValue] = useState(getInitialValue());
    const refSelect = useRef<HTMLSelectElement>(null);

    // AG-Grid는 이 컴포넌트가 getValue 메소드를 가지고 있을 것으로 기대합니다.
    // 이 부분은 ICellEditorComp 인터페이스의 요구사항을 충족시키는 역할을 합니다.
    useImperativeHandle(ref, () => {
        return {
            getValue: () => {
                return value;
            }
        };
    });

    useEffect(() => {
        refSelect.current?.focus();
    }, []);

    return (
        <select
            ref={refSelect}
            value={value || ""}
            onChange={event => setValue(event.target.value)}
            style={{ width: '100%', height: '100%' }}
        >
            <option value="">-- 선택 --</option>
            {props.values.map((itemValue: string) => (
                <option key={itemValue} value={itemValue}>
                    {itemValue}
                </option>
            ))}
        </select>
    );
});