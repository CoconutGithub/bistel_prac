package com.siportal.portal.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;


@Configuration
public class RestTemplateConfig {
    // RestTemplate을 빈으로 등록
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
