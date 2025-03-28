package com.siportal.portal.com.auth;

import com.siportal.portal.mapper.PortalMapper;
import com.siportal.portal.repository.LoginRepository;
import com.siportal.portal.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Value("${spring.application.name}")
    private String title;

    @Value("${database.type}")
    private String databaseType;

    @Autowired
    private LoginRepository loginRepository;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        System.out.println("load FilterChain");
        return http.csrf(csrf -> csrf.disable()) // CSRF 비활성화
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login").permitAll() // 인증 없이 허용
                        .requestMatchers("/admin/api/exist-user").permitAll() // 인증 없이 허용
                        .requestMatchers("/admin/api/register-user").permitAll() // 인증 없이 허용
                        .requestMatchers("/admin/api/register-user2").permitAll() // 인증 없이 허용
                        .requestMatchers("/admin/api/get-msg-list2").permitAll() // 인증 없이 허용
                        .requestMatchers("/biz/flora-resumes/**").permitAll()// 인증 없이 허용
                        .requestMatchers("/biz/hdh-resumes/**").permitAll()// 인증 없이 허용
                        .requestMatchers("/admin/api/update-menu-tree").permitAll() // 인증 없이 허용
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                        }) // ✅ 인증되지 않은 요청 시 401 에러 반환
                )
                .addFilter(new LoginFilter(authenticationManager, loginRepository, title, databaseType))
                .addFilter(new AfterLoginFilter(authenticationManager))
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*"); // 모든 도메인 허용
        configuration.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
        configuration.addAllowedHeader("*"); // 모든 헤더 허용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
