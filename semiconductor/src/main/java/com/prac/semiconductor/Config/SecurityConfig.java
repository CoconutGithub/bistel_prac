package com.prac.semiconductor.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CSRF(Cross-Site Request Forgery) 보호 비활성화 (API 서버에서는 보통 비활성화합니다)
                .csrf(AbstractHttpConfigurer::disable)

                // HTTP 요청에 대한 인가(Authorization) 설정
                .authorizeHttpRequests(authorizeRequests ->
                        // 모든 요청에 대해 인증 없이 접근을 허용
                        authorizeRequests.anyRequest().permitAll()
                );

        return http.build();
    }
}