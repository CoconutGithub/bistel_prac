package com.prac.semiconductor.Dto;

import com.prac.semiconductor.Domain.Process;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class ProcessDto {

    private Integer processId;
    private String processName;
    private List<EquipmentDto> equipments;

    public ProcessDto(Process process) {
        this.processId = process.getProcessID();
        this.processName = process.getProcessName();
        // Equipment 리스트도 DTO로 변환
        this.equipments = process.getEquipments().stream()
                .map(EquipmentDto::new)
                .collect(Collectors.toList());
    }
}