package com.siportal.portal.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.io.IOException;

@Service
public class RagChatbotService {

    @Autowired
    private RestTemplate restTemplate;

    private final String RAG_API_URL = "http://localhost:8000/ask";
    @Autowired
    private ObjectMapper objectMapper;

    public String askRag(String userQuestion) {
        String jsonPayload = "{ \"question\": \"" + userQuestion + "\" }";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                RAG_API_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        return response.getBody();
    }


     private String extractAnswer(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode answerNode = root.path("answer");
            if (!answerNode.isTextual()) {
                return answerNode.asText();
            } else {
                return "답변을 찾을 수 없습니다.";
            }
        } catch (IOException e) {
            e.printStackTrace();
            return "JSON 파싱 오류";
        }
     }
}
