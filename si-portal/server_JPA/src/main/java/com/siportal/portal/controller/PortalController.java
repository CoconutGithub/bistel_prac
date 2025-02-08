package com.siportal.portal.controller;

import com.siportal.portal.service.PortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/") // API 기본 경로
@Transactional
public class PortalController {

    private final PortalService portalService;

    @Autowired
    public PortalController(PortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/page-auth")
    public ResponseEntity<?> getPageAuth(@RequestParam String roleId, @RequestParam String path) {
        return portalService.getPageAuth(roleId, path);
    }

    @GetMapping("/api/get-user")
    public ResponseEntity<?> getUser(@RequestParam String userName) {
        return portalService.getUser(userName);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> requestBody) {
        return portalService.refreshToken(requestBody);
    }

    @PostMapping("/api/update-settings")
    public ResponseEntity<?> updateUserSettings(@RequestBody Map<String, String> settings) {
        return portalService.updateUserSettings(settings);
    }

    @PostMapping("/api/get-settings")
    public ResponseEntity<?> getUserSettings(@RequestBody Map<String, String> requestBody) {
        return portalService.getUserSettings(requestBody);
    }

    @GetMapping("/menu")
    public Map<String, Object> getMenuTreeList(@RequestParam String langCode, @RequestParam String roleId, @RequestParam String isMighty) {
        return portalService.getMenuTreeList(langCode, roleId, isMighty);
    }
}
