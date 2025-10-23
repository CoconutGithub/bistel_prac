package com.siportal.portal.com.auth;

import io.minio.credentials.Jwt;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import java.io.IOException;

public class AfterLoginFilter extends BasicAuthenticationFilter {

    private final JwtUtils jwtUtils;

    public AfterLoginFilter(
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils
    ) {
        super(authenticationManager);
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String uri = request.getRequestURI();
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        String token = header.replace("Bearer ", "");

        System.out.println( "token:" + token);

        String username = jwtUtils.validateTokenAndGetUsername(token);

        System.out.println( "userName:" + username);

        if (username != null) {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(username, null, null)
            );
        }

        chain.doFilter(request, response);
    }
}