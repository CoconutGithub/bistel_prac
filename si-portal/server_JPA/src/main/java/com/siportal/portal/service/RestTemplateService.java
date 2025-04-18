package com.siportal.portal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class RestTemplateService {

    @Autowired
    private RestTemplate restTemplate;

    private final String API_URL = "http://localhost:8000/analyze-sentiment";

    public String analyzeSentiment(String text) {
        // 요청 JSON
        String jsonPayload = "{\"text\": \"" + text + "\"}";

        // HTTP 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HTTP 엔티티 설정
        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

        // POST 요청
        ResponseEntity<String> response = restTemplate.exchange(API_URL, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }
}
