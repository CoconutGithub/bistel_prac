package com.siportal.portal.com.error;

import lombok.AllArgsConstructor;
import lombok.Getter;

/*
 * Token 경우 2000번대 에러코드 사용*/
@AllArgsConstructor
@Getter
public enum TokenErrorCode implements ErrorCodeIfs{

    INVALID_TOKEN(400, 2000, "유요하지 않은 토큰"),
    EXPIRED_TOKEN(400, 2001, "만료된 토큰, 리프래쉬 토큰을 통해 토큰 재발급"),

    TOKEN_EXCEPTION(400, 2002, "토큰 알 수 없는 에러"),
    AUTHORIZATION_TOKEN_NOT_FOUND(400, 2003, "인증 헤더 토큰 없음"),
    ERROR_CREATE_AUTHORIZATION(500,2004, "인증 객체 생성 중 오류")
    ;

    private final Integer httpStatusCode;

    private final Integer errorCode; //내부 코드

    private final String description;
}