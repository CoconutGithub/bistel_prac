package com.prac.semiconductor.Dto;

import com.prac.semiconductor.Domain.Line;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class LineDto {
    private Integer lineId;
    private String lineName;
    private List<ProcessDto> processes;

    public LineDto(Line line) {
        this.lineId = line.getLineID();
        this.lineName = line.getLineName();
        // Process 리스트도 DTO로 변환
        this.processes = line.getProcesses().stream()
                .map(ProcessDto::new)
                .collect(Collectors.toList());
    }
}