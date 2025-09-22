package com.prac.activemq.Domain;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;

@Component("taskA")
public class TaskA implements Task {

    @Override
    public void execute(String payload) {
        System.out.printf("[%s] >>> Task A 실행 시작. 페이로드: %s\n",
                Thread.currentThread().getName(), payload);
        System.out.println(String.valueOf(Date.from(Instant.now())));
        try {
            //10초
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.printf("[%s] <<< Task A 실행 완료.\n", Thread.currentThread().getName());
        System.out.println(String.valueOf(Date.from(Instant.now())));
    }
}
