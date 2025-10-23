package com.siportal.portal.com.exceptionhandler;

import com.siportal.portal.com.api.Api;
import com.siportal.portal.com.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice // 컨트롤러에 적용되는 공통 관심사 분리
@Order(value=Integer.MIN_VALUE) // 최우선 처리
public class ApiExceptionHandler {

    @ExceptionHandler(ApiException.class) // ApiException에 해당하는 예외처리 실행
    public ResponseEntity<Api<Object>> apiException(
            ApiException apiException
    ) {
        log.error("", apiException); //ApiException은 RunTimeException을 상속받았기 때문에 stacktrace 가능

        var errorCode=apiException.getErrorCodeIfs();

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(
                        Api.ERROR(errorCode, apiException.getErrorDescription())
                );

    }
}