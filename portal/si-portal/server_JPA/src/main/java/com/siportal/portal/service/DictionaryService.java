package com.siportal.portal.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.domain.Dictionary;
import com.siportal.portal.repository.DictionaryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryService {
    
    private final DictionaryRepository dictionaryRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // application.properties: AI 번역 API URL
    @Value("${chat.api.translate-url:http://localhost:8000/api/chat/translate}")
    private String chatTranslateUrl;

    @Value("${chat.api.model:gpt-5-mini}")
    private String chatModel;

    // AI 페르소나 설정: 디스플레이 제조 설비 품질 관리자 역할 부여
    private static final String PERSONA_PROMPT = "You are a display manufacturing equipment quality manager. Translate with precise industrial terminology for display production lines (inspection, metrology, AOI, SPC, MES, equipment recipes, defect classification). Preserve model names, part numbers, and units exactly as written.";


    public List<Dictionary> findAll() {
        return dictionaryRepository.findAllByOrderByCreatedAtDesc();
    }


    @Transactional
    public Dictionary create(Dictionary payload) {
        if (dictionaryRepository.existsByDictKey(payload.getDictKey())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 존재하는 dict_key 입니다.");
        }
        return dictionaryRepository.save(payload);
    }


    @Transactional
    public Dictionary update(Long id, Dictionary payload) {
        Dictionary existing = dictionaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "사전에 없는 ID 입니다."));

        if (!existing.getDictKey().equals(payload.getDictKey())
                && dictionaryRepository.existsByDictKey(payload.getDictKey())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 존재하는 dict_key 입니다.");
        }

        existing.setDictKey(payload.getDictKey());
        existing.setKo(payload.getKo());
        existing.setEn(payload.getEn());
        existing.setZh(payload.getZh());
        existing.setVi(payload.getVi());
        return dictionaryRepository.save(existing);
    }

    /**
     * AI 번역 서비스
     * 외부 LLM API(Python FastAPI)를 호출하여 한국어를 영/중/베트남어로 번역합니다.
     * WebClient를 사용하여 비동기 호출 후 블로킹(block)으로 응답을 대기합니다.
     *
     * @param koText 한국어 원문
     * @param authorizationHeader API 인증 토큰
     * @return 번역된 결과 맵 (en, zh, vi)
     */
    public Map<String, String> translateFromKo(String koText, String authorizationHeader) {
        if (koText == null || koText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "한국어 문구가 비어 있습니다.");
        }
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization 헤더가 필요합니다.");
        }

        Map<String, Object> request = new HashMap<>();
        request.put("model", chatModel);
        request.put("stream", false);
        request.put("messages", List.of(
                Map.of("role", "system", "content", PERSONA_PROMPT.trim()),
                Map.of("role", "user", "content", buildUserPrompt(koText))
        ));

        String rawResponse;
        try {
            // WebClient 호출
            rawResponse = webClient.post()
                    .uri(chatTranslateUrl)
                    .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(60)); // 타임아웃 60초
        } catch (WebClientResponseException e) {
            log.error("AI 번역 API 호출 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 번역 호출에 실패했습니다: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("AI 번역 호출 중 예외", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 번역 호출 중 오류가 발생했습니다.", e);
        }

        if (rawResponse == null || rawResponse.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 번역 응답이 비어 있습니다.");
        }

        // 응답 파싱 및 정제
        String content = extractContent(rawResponse);
        String cleaned = stripCodeFence(content);
        try {
            Map<String, String> result = objectMapper.readValue(cleaned, new TypeReference<Map<String, String>>() {
            });
            validateTranslationResult(result);
            return result;
        } catch (JsonProcessingException e) {
            log.error("AI 번역 결과 JSON 파싱 실패. content={}", cleaned);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 번역 결과를 해석할 수 없습니다.", e);
        }
    }

    private String buildUserPrompt(String koText) {
        return """
                Source language: Korean
                Target languages: English (en), Chinese Simplified (zh), Vietnamese (vi).
                Return ONLY valid JSON like {"en":"...","zh":"...","vi":"..."} with no extra text. Keep numbers, units, and model names verbatim.
                Text: """ + koText;
    }

    private String extractContent(String rawResponse) {
        try {
            JsonNode node = objectMapper.readTree(rawResponse);
            JsonNode contentNode = Optional.ofNullable(node)
                    .map(n -> n.path("choices"))
                    .filter(JsonNode::isArray)
                    .filter(n -> n.size() > 0)
                    .map(n -> n.get(0))
                    .map(n -> n.path("message"))
                    .map(n -> n.path("content"))
                    .orElse(null);

            if (contentNode == null || contentNode.isMissingNode() || contentNode.isNull()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 번역 응답에 content가 없습니다.");
            }
            return contentNode.asText();
        } catch (JsonProcessingException e) {
            log.error("AI 번역 원본 응답 파싱 실패: {}", rawResponse, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 번역 응답을 읽지 못했습니다.", e);
        }
    }

    private String stripCodeFence(String text) {
        String trimmed = text == null ? "" : text.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(?:json)?", "");
            trimmed = trimmed.replaceFirst("```\\s*$", "");
        }
        return trimmed.trim();
    }

    private void validateTranslationResult(Map<String, String> result) {
        if (result == null
                || !result.containsKey("en")
                || !result.containsKey("zh")
                || !result.containsKey("vi")) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 번역 결과에 en/zh/vi 키가 없습니다.");
        }
    }
}
