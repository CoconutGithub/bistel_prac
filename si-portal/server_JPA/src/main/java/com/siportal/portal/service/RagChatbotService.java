package com.siportal.portal.service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
//import org.apache.logging.log4j.Logger;
import org.apache.xmlbeans.impl.xb.xsdschema.Public;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Objects;
import com.siportal.portal.dto.ChatbotRequestDTO;
import com.siportal.portal.dto.ChatbotResponseDTO;

@Service
public class RagChatbotService {

    @Autowired
    private RestTemplate restTemplate;

    private final String RAG_API_URL = "http://localhost:8001/ask";
    private final String RAG_FILE_UPLOAD_API_URL = "http://localhost:8001/ask";

    @Autowired
    private ObjectMapper objectMapper;
    private static final Logger log = LoggerFactory.getLogger(RagChatbotService.class);

    public String askRag(String userQuestion) {
        String jsonPayload = "{ \"question\": \"" + userQuestion + "\" }";
        HttpHeaders headers = new HttpHeaders();
        try {
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            System.out.println("질문 전송 중...");
            System.out.println(jsonPayload);
            ResponseEntity<ChatbotResponseDTO> response = restTemplate.exchange(
                    RAG_API_URL,
                    HttpMethod.POST,
                    entity,
                    ChatbotResponseDTO.class
            );
            System.out.println("응답 수신 완료: " + response.getBody());
            ChatbotResponseDTO responseBody = response.getBody();
            System.out.println(">>> 응답 바디: " + response.getBody());
            log.info(">>> RAG 응답: {}", objectMapper.writeValueAsString(responseBody));
            return Objects.requireNonNull(responseBody).getAnswer().getResult();
        } catch (Exception e) {
            log.error("JSON 파싱 실패", e);
            throw new RuntimeException("rag 서버 응답 파싱 중 오류", e);
        }
    }

    public String uploadFiles(MultipartFile[] files, String authHeader) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        if (authHeader != null) {
            headers.add("Authorization", authHeader);
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        for (MultipartFile file : files) {
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("files", resource);
        }

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(RAG_FILE_UPLOAD_API_URL, entity, String.class);
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
