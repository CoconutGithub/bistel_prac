package com.siportal.portal.com.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${token.secret.key}")
    private String secretKey;
    @Value("${token.access-token.plus-hour}")
    private Long accessTokenPlusHour;
    @Value("${token.refresh-token.plus-hour}")
    private Long refreshTokenPlusHour;


    public String generateToken(String username) {
        Instant instant = Instant.now()
                .plus(accessTokenPlusHour, ChronoUnit.HOURS);

        return Jwts.builder()
                .setSubject(username)
                .setExpiration(Date.from(instant))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public String refreshExpiration(String token) {
        String username = validateTokenAndGetUsername(token); // 기존 토큰에서 사용자 정보 추출
        Instant instant = Instant.now()
                .plus(refreshTokenPlusHour, ChronoUnit.HOURS);

        return Jwts.builder()
                .setSubject(username)
                .setExpiration(Date.from(instant)) // 유효 기간 연장
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }


    public String validateTokenAndGetUsername(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}