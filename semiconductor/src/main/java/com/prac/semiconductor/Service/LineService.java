package com.prac.semiconductor.Service;

import com.prac.semiconductor.Domain.Line;
import com.prac.semiconductor.Dto.LineResponseDto;
import com.prac.semiconductor.Repository.LineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LineService {
    private final LineRepository lineRepository;

    @Transactional(readOnly = true) // 조회 전용 트랜잭션으로 성능 최적화
    public List<LineResponseDto> findAllLines() {
        List<Line> lines = lineRepository.findAll();

        // Stream API를 사용하여 List<Line>을 List<LineResponseDto>로 변환
        return lines.stream()
                .map(LineResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}
