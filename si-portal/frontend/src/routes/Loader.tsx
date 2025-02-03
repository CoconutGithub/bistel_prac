import { redirect } from "react-router-dom";
import {store} from "~store/Store";
import {chkButtonAuth} from "~store/AuthSlice";

export const checkBtnAuthLoader = async () => {

    const isAuthenticated = store.getState().auth.isAuthenticated; // Redux 상태 가져오기

    if (!isAuthenticated) {
        console.log("여기 들어온다.............")
        // 인증되지 않은 경우 리다이렉트
        return redirect("/");
    }

    try {
        // 현재 경로를 가져와 chkButtonAuth 호출
        const pathName = window.location.pathname;
        console.log("Loader수행함---->", pathName);
        await store.dispatch(chkButtonAuth(pathName));
    } catch (error) {
        console.error("Failed to load button permissions:", error);
    }

    return null; // 인증된 경우 아무 작업도 하지 않음
};