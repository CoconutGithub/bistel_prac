package com.siportal.portal.com.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.dto.User;
import com.siportal.portal.mapper.PortalMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
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

    private String title;
    private final AuthenticationManager authenticationManager;
    private PortalMapper portalMapper;

    public LoginFilter(AuthenticationManager authenticationManager, PortalMapper portalMapper, String title) {
        this.authenticationManager = authenticationManager;
        this.portalMapper = portalMapper;
        this.title = title;
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
            String userId = authRequest.get("userId");
            String password = authRequest.get("password");

            System.out.println("userId:" + userId);
            System.out.println("password:" + password);


            // Oracle DB에서 사용자 확인
            User user = validateUserFromDB(userId, password);
            if (validateUserFromDB(userId, password) == null) {
                throw new BadCredentialsException("Invalid userid or password");
            }

            // 인증 객체 생성
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(userId, password);

            // 추가 정보를 details에 저장
            authenticationToken.setDetails(user);

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

        System.out.println(authResult);
        User user = (User)authResult.getDetails();

        // JWT 생성
        String token = generateJwtToken(authResult);

        // 응답 헤더 또는 바디에 JWT 추가
        response.setContentType("application/json");
        response.getWriter().write("{\"token\": \"" + token +
                "\", \"title\": \"" + title +
                "\", \"userId\": \"" + user.getUserId() +
                "\", \"userName\": \"" + user.getUserName() +
                "\", \"email\": \"" + user.getEmail() + "\"}");

    }

    private String generateJwtToken(Authentication authResult) {
        String userId = authResult.getName();
        return JwtUtils.generateToken(userId);
    }

    private User validateUserFromDB(String username, String password) {
        User user = null;
        try {
            user = portalMapper.getUserByUserId(username, password);
        } catch (Exception ex) {
            ex.printStackTrace();
            log.error(ex.toString());
            return null;
        }

        return user;
    }
}
