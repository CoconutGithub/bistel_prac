package com.prac.semiconductor.Controller;

import com.prac.semiconductor.Dto.LineResponseDto;
import com.prac.semiconductor.Service.LineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/lines")
@RequiredArgsConstructor
public class LineController {
    private final LineService lineService;

    @GetMapping // HTTP GET 요청을 처리합니다. 경로는 /api/lines 입니다.
    public ResponseEntity<List<LineResponseDto>> getLines() {
        List<LineResponseDto> lines = lineService.findAllLines();
        return ResponseEntity.ok(lines); // 성공 응답(200 OK)과 함께 라인 목록을 반환
    }
}
