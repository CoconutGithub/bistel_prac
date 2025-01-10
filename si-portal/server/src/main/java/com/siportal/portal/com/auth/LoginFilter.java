package com.siportal.portal.com.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.dto.User;
import com.siportal.portal.mapper.PortalMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private final AuthenticationManager authenticationManager;
    private PortalMapper portalMapper;

    public LoginFilter(AuthenticationManager authenticationManager, PortalMapper portalMapper) {
        this.authenticationManager = authenticationManager;
        this.portalMapper = portalMapper;
        setFilterProcessesUrl("/login"); // 필터가 처리할 URL
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) {
        try {
            // 요청 본문에서 JSON 데이터 읽기
            String requestBody = request.getReader().lines().collect(Collectors.joining());
            ObjectMapper objectMapper = new ObjectMapper();

            // JSON 데이터를 파싱하여 ID와 Password 추출
            Map<String, String> authRequest = objectMapper.readValue(requestBody, Map.class);
            String username = authRequest.get("id");
            String password = authRequest.get("password");

            System.out.println("username:" + username);
            System.out.println("password:" + password);


            // Oracle DB에서 사용자 확인
            if (!validateUserFromDB(username, password)) {
                throw new BadCredentialsException("Invalid username or password");
            }

            // 인증 객체 생성
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(username, password);
            return authenticationToken;

        } catch (Exception e) {
            throw new RuntimeException("Authentication failed");
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authResult) throws IOException {
        // JWT 생성
        String token = generateJwtToken(authResult);

        // 응답 헤더 또는 바디에 JWT 추가
        response.setContentType("application/json");
        response.getWriter().write("{\"token\": \"" + token + "\"}");
    }

    private String generateJwtToken(Authentication authResult) {
        String username = authResult.getName();
        return JwtUtils.generateToken(username);
    }

    private boolean validateUserFromDB(String username, String password) {
        boolean rtnValue = false;
        try {
            User user = portalMapper.getUserByName(username, password);
            if (user != null) {
                rtnValue = true;
            } else {
                rtnValue = false;
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            log.error(ex.toString());
            return false;
        }

        return rtnValue;
    }
}
