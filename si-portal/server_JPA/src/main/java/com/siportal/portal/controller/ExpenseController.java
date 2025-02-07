package com.siportal.portal.controller;

import com.siportal.portal.dto.ExpenseRequest;
import com.siportal.portal.dto.FileRequest;
import com.siportal.portal.service.ExpenseService;
import com.siportal.portal.service.FileService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/expense")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private FileService fileService;

    @PostMapping("/create")
    public ResponseEntity<String> createExpense(@RequestBody List<ExpenseRequest> expenseRequests) {
        log.info("📌 [Request] /api/expense/create 요청이 도착했습니다. 요청 개수: {}", expenseRequests.size());

        if (expenseRequests == null || expenseRequests.isEmpty()) {
            log.error("❌ [Error] 요청 데이터가 비어 있습니다!");
            return ResponseEntity.badRequest().body("요청 데이터가 비어 있습니다.");
        }

        try {
            for (ExpenseRequest request : expenseRequests) {

                long fileGroupId = expenseService.saveExpense(request);
                log.info("✅ [Success] p_expense 저장 완료. 생성된 fileGroupId: {}", fileGroupId);

                List<FileRequest> files = request.getFiles();
                if (files != null && !files.isEmpty()) {
                    log.info("📂 [File] {}개의 파일을 저장합니다.", files.size());
                    fileService.saveFiles(fileGroupId, files);
                }
            }

            return ResponseEntity.ok("데이터 저장을 성공하였습니다");
        } catch (Exception e) {
            log.error("❌ [Exception] 서버에서 에러 발생!", e);
            return ResponseEntity.status(500).body("서버 내부 오류가 발생했습니다.");
        }
    }
}
