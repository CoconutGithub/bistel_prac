package com.siportal.portal.controller;

import com.siportal.portal.service.SqlBotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/biz/sqlbot")
public class SqlBotController {

    @Autowired
    private SqlBotService sqlBotService;

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> query(@RequestBody Map<String, Object> request,
                                                     @RequestHeader(value = "Authorization", required = false) String authHeader) {
        System.out.println("DEBUG: SqlBotController received AuthHeader: " + (authHeader != null ? authHeader.substring(0, Math.min(10, authHeader.length())) + "..." : "null"));
        String question = (String) request.get("question");
        boolean chartMode = Boolean.TRUE.equals(request.get("chart_mode"));

        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question is required"));
        }

        Map<String, Object> result = sqlBotService.generateAndExecuteSql(question, chartMode, authHeader);
        return ResponseEntity.ok(result);
    }
}
