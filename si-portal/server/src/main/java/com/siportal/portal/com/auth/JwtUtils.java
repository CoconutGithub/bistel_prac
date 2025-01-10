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
                .setExpiration(new Date(System.currentTimeMillis() + 864_000_000))
//                .signWith(SignatureAlgorithm.HS512, SECRET)
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