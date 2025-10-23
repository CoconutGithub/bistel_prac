package com.siportal.portal.com.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Getter
public enum ErrorCode implements ErrorCodeIfs{

    OK(200, 200, "성공"),

    BAD_REQEUST(HttpStatus.BAD_REQUEST.value(), 400, "잘못된 요청"),

    NOT_FOUND(HttpStatus.NOT_FOUND.value(), 404, "요청한 리소스를 찾을 수 없습니다"),

    AUTH_ERROR(403, 403, "인증 오류"),

    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR.value(), 500, "서버 에러"),

    NULL_POINT(HttpStatus.INTERNAL_SERVER_ERROR.value(), 512, "Null Point"),

    FORBIDDEN_ERROR(HttpStatus.FORBIDDEN.value(), 403, "접근 권한이 없습니다."),

    ;

    private final Integer httpStatusCode;

    private final Integer errorCode; // 커스텀 코드

    private final String description;
}