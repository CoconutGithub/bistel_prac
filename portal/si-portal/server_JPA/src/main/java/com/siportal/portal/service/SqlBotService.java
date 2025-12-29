package com.siportal.portal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SqlBotService {

    private static final Logger log = LoggerFactory.getLogger(SqlBotService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // application.properties의 키와 매칭. 기본값은 localhost:8000
    @Value("${chat.api.completions-url:http://localhost:8000/api/chat/completions}")
    private String chatApiUrl;

    @Value("${chat.api.model:gpt-3.5-turbo}")
    private String chatModel;

    public Map<String, Object> generateAndExecuteSql(String userQuestion, String authHeader) {
        Map<String, Object> result = new HashMap<>();

        // 1. 프롬프트 구성: 시스템 프롬프트 + 사용자 질문
        String prompt = createSystemPrompt() + "\n\nUser Question: " + userQuestion + "\nSQL:";

        // 2. LLM 호출하여 SQL 생성 (외부 FastAPI 서버 호출)
        String rawSql = callLlmApi(prompt, authHeader);
        String cleanedSql = cleanSql(rawSql);
        
        result.put("generatedSql", cleanedSql);

        // 3. SQL 검증 및 실행 (SELECT 문만 허용)
        if (isValidSql(cleanedSql)) {
            try {
                log.info("Executing SQL: {}", cleanedSql);
                // JDBC를 사용하여 동적 SQL 실행
                List<Map<String, Object>> dataList = jdbcTemplate.queryForList(cleanedSql);
                result.put("data", dataList);
                
                // 컬럼 정보 추출 (Grid 헤더 생성용)
                if (!dataList.isEmpty()) {
                    result.put("columns", dataList.get(0).keySet());
                } else {
                    result.put("columns", Collections.emptyList());
                }
                
            } catch (Exception e) {
                log.error("SQL 실행 중 오류 발생", e);
                result.put("error", "SQL 실행 실패: " + e.getMessage());
            }
        } else {
            result.put("error", "생성된 SQL이 유효하지 않거나 허용되지 않는 구문입니다. (SQL: " + cleanedSql + ")");
        }

        return result;
    }

    private String createSystemPrompt() {
        return """
You are a PostgreSQL SQL expert. Convert the user's natural language question into a runnable SQL query.

Target Tables:
1. pipe_yield_lot (Pipe/Gang-gwan)
   - lot_no, heat_no, item_type, steel_grade_l, work_date, prod_qty, yield_rate, excess_yn, yield_diff, order_outer_dia, order_inner_dia, order_thickness
2. bar_yield_lot (Bar/Gang-bong)
   - lot_no, heat_no, item_type, steel_grade_l, work_date, prod_qty, yield_rate, excess_yn, yield_diff, order_width, integrated_yield, final_yield

Rules:
1. Output ONLY the SQL query. No explanations.
2. Start with 'SELECT'.
3. Use 'pipe_yield_lot' for pipes, 'bar_yield_lot' for bars.
4. If ambiguous, choose the most likely table or union if appropriate (but simpler is better).
5. Do NOT use markdown formatting like ```sql.
6. Handle date comparisons carefully (strings like 'YYYY-MM-DD').
""";
    }

    private String cleanSql(String sql) {
        if (sql == null) return "";
        String cleaned = sql.trim();
        // Markdown code block removal
        cleaned = cleaned.replaceAll("```sql", "").replaceAll("```", "");
        return cleaned.trim();
    }

    private String callLlmApi(String prompt, String authHeader) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (authHeader != null && !authHeader.isBlank()) {
                headers.set(HttpHeaders.AUTHORIZATION, authHeader);
                log.info("DEBUG: Sending Authorization header to LLM: {}", authHeader.substring(0, Math.min(10, authHeader.length())) + "...");
            } else {
                log.warn("DEBUG: Authorization header is missing or empty in SqlBotService");
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", chatModel);
            requestBody.put("stream", false); // 스트림 비활성화 (JSON 응답 요청)
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", "You are a helpful data assistant."),
                    Map.of("role", "user", "content", prompt)
            ));
            
            // temperature 옵션 제거 (모델이 지원하지 않을 수 있음)
            // requestBody.put("temperature", 0.0);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // RestTemplate을 사용하여 동기식 HTTP POST 요청
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(chatApiUrl, entity, JsonNode.class);

            if (response.getBody() != null) {
                // OpenAI Chat Completion 구조 파싱
                // { "choices": [ { "message": { "content": "SELECT..." } } ] }
                JsonNode choices = response.getBody().path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    return choices.get(0).path("message").path("content").asText();
                }
            }
        } catch (Exception e) {
            log.error("LLM API 호출 실패: {}", e.getMessage());
            return "Error calling LLM API";
        }
        return "No response from LLM";
    }

    private boolean isValidSql(String sql) {
        if (sql == null || sql.isBlank()) return false;
        String upperSql = sql.trim().toUpperCase();
        return upperSql.startsWith("SELECT");
    }
}
