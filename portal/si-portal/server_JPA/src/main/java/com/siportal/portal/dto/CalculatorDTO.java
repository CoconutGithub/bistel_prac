package com.siportal.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CalculatorDTO {
    // [수정됨] 요청과 응답에서 공통으로 사용할 수식 필드
    private String expression;

    // [수정됨] 응답 시에만 채워질 결과값 (요청 시에는 null)
    private Double result;

    // [수정됨] 에러 발생 시 담길 메시지
    private String errorMessage;

    // [수정됨] 성공 여부 (boolean 타입은 getSuccess()로 생성되어 JSON에서는 "success" 키로 매핑됨)
    private boolean success;
}