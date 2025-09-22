package com.prac.activemq.Service;

import com.prac.activemq.DTO.MessageDTO;
import com.prac.activemq.Domain.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class TaskProcessor {

    @Autowired
    private Map<String, Task> tasks;

    @Async
    public void process(MessageDTO request) {
        // 비동기 실행을 확인합니다.
        System.out.printf("[%s] 비동기 작업 처리 시작: %s\n",
                Thread.currentThread().getName(), request.toString());

        Task task = tasks.get("task" + request.getTarget());

        if (task != null) {
            task.execute(request.getPayload());
        } else {
            System.err.println("실행할 수 있는 작업을 찾지 못했습니다: " + request.getTarget());
        }

        System.out.printf("[%s] 비동기 작업 처리 완료.\n", Thread.currentThread().getName());
    }
}
