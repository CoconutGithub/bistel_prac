package com.siportal.portal.com.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

/*
 * User의 경우 1000번대 에러코드 사용*/
@AllArgsConstructor
@Getter
public enum UserErrorCode implements ErrorCodeIfs{

    USER_NOT_FOUNT(400, 1404, "사용자를 찾을 수 없음."),
    INVALID_PASSWORD(400, 1405, "잘못된 비밀번호."),
    DUPLICATE_CARE_ERROR(404, 1600, "중복된 보호자 등록"),
    NOT_FOUND_CARE_RECEIVER(404, 1601, "not found care receiver")
    ;


    private final Integer httpStatusCode;

    private final Integer errorCode; //내부 코드

    private final String description;

    /*@Override
    public Integer getHttpStatusCode() {
        return 0;
    }

    @Override
    public Integer getErrorCode() {
        return 0;
    }

    @Override
    public String getDescription() {
        return "";
    }*/
}