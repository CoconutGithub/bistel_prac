package com.prac.semiconductor.Controller;

import com.prac.semiconductor.Dto.LineDto;
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

    @GetMapping("/factory-data")
    public ResponseEntity<List<LineDto>> getFactoryData() {
        List<LineDto> data = lineService.getFullFactoryData();
        return ResponseEntity.ok(data);
    }
}
