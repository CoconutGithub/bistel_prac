package com.prac.activemq.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prac.activemq.DTO.MessageDTO;
import com.prac.activemq.Service.TaskProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MessageReceiver {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TaskProcessor taskProcessor;

    private static final String TASK_QUEUE = "task-queue";

    @JmsListener(destination = TASK_QUEUE)
    public void receiveMessage(String message) {
        System.out.println("수신된 메시지: " + message);
        try {
            MessageDTO taskRequest = objectMapper.readValue(message, MessageDTO.class);

            taskProcessor.process(taskRequest);

        } catch (JsonProcessingException e) {
            System.err.println("메시지 파싱 오류: " + e.getMessage());
        }
    }
}

