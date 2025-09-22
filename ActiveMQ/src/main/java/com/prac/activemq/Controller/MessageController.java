package com.prac.activemq.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prac.activemq.DTO.MessageDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MessageController {

    @Autowired
    private JmsTemplate jmsTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TASK_QUEUE = "task-queue";

    @PostMapping("/send")
    public String sendMessage(@RequestBody MessageDTO taskRequest) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(taskRequest);

            jmsTemplate.convertAndSend(TASK_QUEUE, jsonMessage);

            return "메시지 전송 성공: " + jsonMessage;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return "메시지 전송 실패: JSON 변환 오류";
        }
    }
}