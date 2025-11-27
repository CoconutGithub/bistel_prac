package com.siportal.portal.controller;

import com.siportal.portal.dto.CalculatorDTO;
import com.siportal.portal.service.CalculatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calculator")
@RequiredArgsConstructor
public class CalculatorController {

    private final CalculatorService calculatorService;

    @PostMapping("/calculate")
    public ResponseEntity<CalculatorDTO> calculate(@RequestBody CalculatorDTO requestDto) {
        try {
            Double result = calculatorService.calculate(requestDto.getExpression());

            CalculatorDTO responseDto = new CalculatorDTO(
                    requestDto.getExpression(),
                    result,
                    null,
                    true
            );

            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            CalculatorDTO errorResponse = new CalculatorDTO(
                    requestDto.getExpression(),
                    null,
                    e.getMessage(),
                    false
            );

            return ResponseEntity.ok(errorResponse);
        }
    }
}