package com.prac.activemq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class ActiveMqApplication {

    public static void main(String[] args) {
        SpringApplication.run(ActiveMqApplication.class, args);
    }

}
