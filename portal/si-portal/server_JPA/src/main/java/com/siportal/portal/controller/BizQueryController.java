package com.siportal.portal.controller;

import com.siportal.portal.dto.YieldQueryDTO;
import com.siportal.portal.service.YieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/biz/query")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
public class BizQueryController {

    private final YieldService yieldService;

    // [DEPRECATED] Generic Query
    @PostMapping("/yield")
    public ResponseEntity<Map<String, Object>> queryYield(@RequestBody YieldQueryDTO request) {
        return executeQuery(() -> yieldService.searchYield(request), "Generic Yield Query");
    }

    // [SPECIALIZED 1] Bar High Yield
    @PostMapping("/bar/high-yield")
    public ResponseEntity<Map<String, Object>> queryBarHighYield(@RequestBody YieldQueryDTO request) {
        return executeQuery(() -> yieldService.findHighYieldBars(request.getMin_yield()), "Bar High Yield Query (>= " + request.getMin_yield() + "%)");
    }

    // [SPECIALIZED 1-2] Bar Low Yield
    @PostMapping("/bar/low-yield")
    public ResponseEntity<Map<String, Object>> queryBarLowYield(@RequestBody YieldQueryDTO request) {
        return executeQuery(() -> yieldService.findLowYieldBars(request.getMax_yield()), "Bar Low Yield Query (<= " + request.getMax_yield() + "%)");
    }

    // [SPECIALIZED 2] Pipe Low Yield
    @PostMapping("/pipe/low-yield")
    public ResponseEntity<Map<String, Object>> queryPipeLowYield(@RequestBody YieldQueryDTO request) {
        return executeQuery(() -> yieldService.findLowYieldPipes(request.getStart_date(), request.getEnd_date(), request.getMax_yield()), "Pipe Low Yield Query (<= " + request.getMax_yield() + "%)");
    }

    // [SPECIALIZED 2-2] Pipe High Yield
    @PostMapping("/pipe/high-yield")
    public ResponseEntity<Map<String, Object>> queryPipeHighYield(@RequestBody YieldQueryDTO request) {
        return executeQuery(() -> yieldService.findHighYieldPipes(request.getStart_date(), request.getEnd_date(), request.getMin_yield()), "Pipe High Yield Query (>= " + request.getMin_yield() + "%)");
    }

    // [SPECIALIZED 3] Excess Production
    @PostMapping("/excess")
    public ResponseEntity<Map<String, Object>> queryExcess(@RequestBody YieldQueryDTO request) {
        return executeQuery(() -> yieldService.findExcessProduction(request.getProduct_type()), "Excess Production Query (" + request.getProduct_type() + ")");
    }

    // Helper method for consistent response format
    private ResponseEntity<Map<String, Object>> executeQuery(java.util.function.Supplier<List<?>> supplier, String sqlDesc) {
        try {
            List<?> data = supplier.get();
            Map<String, Object> response = new HashMap<>();
            response.put("data", data);
            response.put("sql", sqlDesc);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
