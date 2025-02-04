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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private String title;
    private final AuthenticationManager authenticationManager;
    private PortalMapper portalMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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
            ResponseEntity<?> responseEntity = validateUserFromDB(userId, password);

            if (responseEntity.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                // 인증 실패 시, 에러 메시지 반환
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"" + responseEntity.getBody() + "\"}");
                return null;
            }

            // 인증 성공 시, User 객체 반환
            User user = (User) responseEntity.getBody();

            // 인증 객체 생성
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(userId, password);

            // 추가 정보를 details에 저장
            authenticationToken.setDetails(user);

            return authenticationToken;

        } catch (BadCredentialsException e) {
            try {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
            } catch (IOException ioException) {
                ioException.printStackTrace();
            }
            return null;
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
                "\", \"roleId\": \"" + user.getRoleId() +
                "\", \"roleName\": \"" + user.getRoleName() +
                "\", \"isMighty\": \"" + user.getIsMighty() +
                "\", \"phoneNumber\": \"" + user.getPhoneNumber() +

                "\", \"footerYN\": \"" + user.getFooterYN() +
                "\", \"headerColor\": \"" + user.getHeaderColor() +
                "\", \"email\": \"" + user.getEmail() + "\"}");

    }

    private String generateJwtToken(Authentication authResult) {
        String userId = authResult.getName();
        return JwtUtils.generateToken(userId);
    }

    private ResponseEntity<?> validateUserFromDB(String username, String password) {
        User user = null;
        try {
            // 비밀번호 없이 사용자 정보 조회
            user = portalMapper.getUserByUserId(username);

            // 사용자가 존재하지 않거나 비밀번호가 일치하지 않는 경우
            if (user == null) {
                log.error("Invalid username.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("존재하지 않는 회원입니다.");
            } else if (!passwordEncoder.matches(password, user.getPassword())) {
                log.error("Invalid password.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("로그인에 실패했습니다. 관리자에게 문의하십시오.");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            log.error(ex.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 오류가 발생했습니다.");
        }
        portalMapper.updateLastLoginDate(user.getUserId()); // 로그인 성공 시 last_login_date 업데이트
        // 로그인 성공 시 user 객체 반환
        return ResponseEntity.ok(user);
    }
}
