package com.siportal.portal.com.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@AllArgsConstructor
@Getter
public enum FileErrorCode implements ErrorCodeIfs{

    FILE_ALREADY_EXISTS(HttpStatus.BAD_REQUEST.value(), 3000, "이미 존재하는 파일입니다."),

    FILE_NOT_FOUND(HttpStatus.NOT_FOUND.value(), 3004, "파일이 존재하지 않습니다."),

    FAILED_FILE_SAVE(HttpStatus.INTERNAL_SERVER_ERROR.value(), 3001, "서버 문제로 파일 저장에 실패하였습니다."),

    FAILED_FILE_GET(HttpStatus.INTERNAL_SERVER_ERROR.value(), 3005, "서버 문제로 파일 조회에 실패하였습니다."),

    FAILED_FILE_UPDATE(HttpStatus.INTERNAL_SERVER_ERROR.value(), 3009, "서버 문제로 파일 업데이트에 실패하였습니다."),

    INVALID_FILE_DELETE_REQUEST(HttpStatus.BAD_REQUEST.value(), 3007, "잘못된 파일 삭제 요청입니다."),

    INVALID_FILE_DELETE_AUTHORIZATION(HttpStatus.FORBIDDEN.value(), 3008, "해당 파일을 삭제할 권한이 없습니다.")
    ;

    private final Integer httpStatusCode;

    private final Integer errorCode; // 커스텀 코드

    private final String description;
}