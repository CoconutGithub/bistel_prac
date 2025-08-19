package com.prac.semiconductor.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.prac.semiconductor.Domain.SetValue;
import com.prac.semiconductor.Domain.ValueType;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class SetValueDto {

    private Integer parameterId;
    private String parameterCode;
    private String parameterName;
    private String unit;
    private ValueType valueType;
    private Integer decimals;
    private BigDecimal setValueNum;
    private String setValueText;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime updatedAt;

    // Entity를 DTO로 변환하는 생성자
    public SetValueDto(SetValue setValue) {
        this.parameterId = setValue.getParameter().getParameterId();
        this.parameterCode = setValue.getParameter().getParameterCode();
        this.parameterName = setValue.getParameter().getParameterName();
        this.unit = setValue.getParameter().getUnit();
        this.valueType = setValue.getParameter().getValueType();
        this.decimals = setValue.getParameter().getDecimals();
        this.setValueNum = setValue.getSetValueNum();
        this.setValueText = setValue.getSetValueText();
        this.updatedAt = setValue.getUpdatedAt();
    }
}