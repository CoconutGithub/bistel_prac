package com.prac.semiconductor.Dto;

import com.prac.semiconductor.Domain.Line;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LineResponseDto {

    private final Integer id;
    private final String lineName;
    private final String lineLocation;
    private final String lineUnit;

    @Builder
    public LineResponseDto(Integer id, String lineName, String lineLocation, String lineUnit) {
        this.id = id;
        this.lineName = lineName;
        this.lineLocation = lineLocation;
        this.lineUnit = lineUnit;
    }

    // Entity를 DTO로 변환하는 정적 메소드
    public static LineResponseDto fromEntity(Line line) {
        return LineResponseDto.builder()
                .id(line.getLineID())
                .lineName(line.getLineName())
                .lineLocation(line.getLineLocation())
                .lineUnit(line.getLineUnit())
                .build();
    }
}