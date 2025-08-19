package com.prac.semiconductor.Service;

import com.prac.semiconductor.Domain.Line;
import com.prac.semiconductor.Dto.LineDto;
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

    @Transactional(readOnly = true) // 조회 성능 최적화
    public List<LineDto> getFullFactoryData() {
        // Repository에서 JOIN FETCH로 모든 데이터를 조회
        return lineRepository.findAllWithDetails().stream()
                .map(LineDto::new) // Line Entity를 LineDto로 변환
                .collect(Collectors.toList());
    }
}
