package com.downsampling.downsampling.controller;

import com.downsampling.downsampling.service.DataService;
import com.downsampling.downsampling.service.DownsamplingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ApiController {

    private final DataService dataService;
    private final DownsamplingService downsamplingService;

    @GetMapping("/init-data")
    public ResponseEntity<String> initData() {
        new Thread(dataService::generateData).start();
        return ResponseEntity.ok("Data generation started in background. Check logs for progress.");
    }

    @GetMapping("/chart-data")
    public ResponseEntity<List<DownsamplingService.Point>> getChartData(
            @RequestParam(defaultValue = "2000") int threshold,
            @RequestParam(defaultValue = "LTTB") String method) {
        log.info("Requesting chart data with threshold: {}, method: {}", threshold, method);
        List<DownsamplingService.Point> data = downsamplingService.getDownsampledData(threshold, method);
        return ResponseEntity.ok(data);
    }
}
