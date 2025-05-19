package com.siportal.portal.config;

import com.siportal.portal.com.auth.AfterLoginFilter;
import com.siportal.portal.com.auth.LoginFilter;
import com.siportal.portal.repository.LoginRepository;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter;
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
                        .requestMatchers("/biz/information/**").permitAll() // 인증 없이 허용
                        .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll() // 모든 ASYNC 디스패치에 대해 permitAll
                        .requestMatchers("/biz/chatbot/ask").permitAll() // 인증 없이 허용
                        .requestMatchers("/error").permitAll() // for chatbot test
                        .requestMatchers("/admin/api/update-menu-tree").permitAll() // 인증 없이 허용
                        .requestMatchers("/admin/api/check-menu-id-duplicate").permitAll() // ← 이게 없으면 인증 필요함
                        .requestMatchers("/admin/api/get-menu-tree").permitAll() // ✅ 추가
                        .requestMatchers(
                            "/swagger-ui/**", // Swagger UI 경로 허용
                            "/v3/api-docs/**", // OpenAPI 문서 경로 허용
                            "/swagger-ui.html" // Swagger HTML 경로 허용
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .anonymous(anonymous -> anonymous
                        .principal("anonymousUser")
                        .authorities("ROLE_ANONYMOUS")
                ) // 익명 사용자 설정 추가
                .exceptionHandling(exception -> exception
                                .authenticationEntryPoint((request, response, authException) -> {
                                    if (!response.isCommitted()) {
                                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"); // ✅ 인증되지 않은 요청 시 401 에러 반환
                                    } else {
                                        // 이미 응답이 커밋된 경우, 에러 로깅 또는 다른 처리
                                        System.err.println("AuthenticationEntryPoint: Response already committed for request: " + request.getRequestURI() + ", cannot send SC_UNAUTHORIZED.");
                                    }
                                })
                )
                .requestCache(cache -> cache.disable())
                .securityContext(context -> context.disable())
                // 비동기 요청 처리를 위한 설정 추가
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilter(new LoginFilter(authenticationManager, loginRepository, title, databaseType))
                .addFilter(new AfterLoginFilter(authenticationManager))
                .build();
    }
    @Bean
    public WebAsyncManagerIntegrationFilter webAsyncManagerIntegrationFilter() {
        return new WebAsyncManagerIntegrationFilter();
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

        configuration.setAllowCredentials(true); // 인증 정보 허용
        configuration.setMaxAge(3600L); // CORS 프리플라이트 캐싱 시간 (1시간)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
