package com.siportal.portal.controller;

import com.siportal.portal.domain.BarYieldLot;
import com.siportal.portal.domain.PipeYieldLot;
import com.siportal.portal.domain.YieldHistory;
import com.siportal.portal.dto.ItemCriteriaDTO;
import com.siportal.portal.service.YieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/yield")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})// React 개발 포트 허용
public class YieldController {

    private final YieldService yieldService;

    // 1. 강관 수율 이상 정보 조회
    @GetMapping("/pipe")
    public ResponseEntity<List<PipeYieldLot>> getPipeYieldLots() {
        return ResponseEntity.ok(yieldService.getPipeYieldLots());
    }

    // 2. 강봉 수율 이상 정보 조회
    @GetMapping("/bar")
    public ResponseEntity<List<BarYieldLot>> getBarYieldLots() {
        return ResponseEntity.ok(yieldService.getBarYieldLots());
    }

    // 3. 아이템(9가지 그룹) 기준 수율 이력 조회 (트렌드 차트용)
    // GET 요청 시 쿼리 파라미터가 많으므로 POST로 본문에 담아 보내거나, ModelAttribute를 사용합니다.
    // 여기서는 프론트엔드에서 깔끔한 JSON 전송을 위해 POST 방식을 사용하겠습니다.
    @PostMapping("/history")
    public ResponseEntity<List<YieldHistory>> getYieldHistory(@RequestBody ItemCriteriaDTO criteria) {
        return ResponseEntity.ok(yieldService.getYieldHistoryByCriteria(criteria));
    }

    @GetMapping("/pipe-date")
    public ResponseEntity<List<PipeYieldLot>> getPipeYieldLotsDate(@RequestParam(value = "startDate", required = false) String startDate,
                                                                   @RequestParam(value = "endDate", required = false) String endDate) {
        return ResponseEntity.ok(yieldService.getPipeYieldLotsByWorkDate(startDate, endDate));
    }

    @GetMapping("/bar-date")
    public ResponseEntity<List<BarYieldLot>> getBarYieldLotsDate(@RequestParam(value = "startDate", required = false) String startDate,
                                                                   @RequestParam(value = "endDate", required = false) String endDate) {
        return ResponseEntity.ok(yieldService.getBarYieldLotsByWorkDate(startDate,endDate));
    }
}
