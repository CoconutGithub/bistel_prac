package com.prac.semiconductor.Dto;

import com.prac.semiconductor.Domain.Equipment;
import com.prac.semiconductor.Dto.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class EquipmentDto {

    private Integer equipmentId;
    private String equipmentName;
    private List<SetValueDto> setValues;

    public EquipmentDto(Equipment equipment) {
        this.equipmentId = equipment.getEquipmentID();
        this.equipmentName = equipment.getEquipmentName();
        // SetValue 리스트도 DTO로 변환
        this.setValues = equipment.getSetValues().stream()
                .map(SetValueDto::new)
                .collect(Collectors.toList());
    }
}