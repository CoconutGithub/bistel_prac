import React, {useContext, useEffect} from 'react';
import {useDispatch} from "react-redux";
import { chkLoginToken } from "components/portal/com/store/AuthSlice";
import { ComAPIContext } from "components/portal/com/context/ComAPIContext";

function SubServiceC1() {
    const dispatch = useDispatch();
    const comAPIContext = useContext(ComAPIContext);

    useEffect(() => {
        //모든 화면에 redering 최최 한번 되는 로직에 넣어야 함
        dispatch(chkLoginToken());

        comAPIContext.showToast('SubServiceC1.', 'dark');
    }, []);

    return <h1>Sub Service C1...</h1>;
}

export default SubServiceC1;
