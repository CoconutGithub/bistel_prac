package com.siportal.portal.com.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;


public class JwtUtils {

    private static final SecretKey SECRET = Keys.secretKeyFor(SignatureAlgorithm.HS256);


    public static String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setExpiration(new Date(System.currentTimeMillis() + 30 * 60 * 1000)) // 우선 세션 유지 시간은 30분으로 지정한다.
                .signWith(SECRET)
                .compact();
    }

    public static String validateTokenAndGetUsername(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}