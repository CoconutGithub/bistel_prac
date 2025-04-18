package com.siportal.portal.controller.biz;
import com.siportal.portal.dto.ChatbotRequestDTO;
import com.siportal.portal.service.RagChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/biz/chatbot")
public class ChatbotController {

    @Autowired
    private RagChatbotService ragChatbotService;

    @PostMapping("/ask")
//    public ResponseEntity<String> ask(@RequestBody Map<String, String> payload) {
    public ResponseEntity<String> ask(@RequestBody ChatbotRequestDTO request) {
//        String question = payload.get("question");
        String answer = ragChatbotService.askRag(request.getQuestion());
        return ResponseEntity.ok(answer);
    }
}
