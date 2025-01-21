package com.siportal.portal.service;

import com.siportal.portal.com.auth.JwtUtils;
import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.PMenuDTO;
import com.siportal.portal.mapper.PortalMapper;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/") // API 기본 경로
public class PortalService {

    @Autowired
    private PortalMapper portalMapper;

    @GetMapping("/api/get-user")
    public ResponseEntity<?> getUser(@RequestParam String userName) {

        try {
            List<ComResultMap> result = this.portalMapper.getUserByUserName(userName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> requestBody) {

        try {
            String oldToken = requestBody.get("token");
            String newToken = JwtUtils.refreshExpiration(oldToken);

            return ResponseEntity.ok(Collections.singletonMap("token", newToken));
        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token expired");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    @PostMapping("/api/update-settings")
    public ResponseEntity<?> updateUserSettings(@RequestBody Map<String, String> settings) {
        try {

            System.out.println("Received settings: " + settings);

            String userId = settings.get("userId");
            String footerYn = settings.get("footerYn");
            String headerColor = settings.get("headerColor");

            if (userId == null || userId.isEmpty()) {
                System.err.println("Error: userId is missing or invalid.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Error: userId is missing or invalid.");
            }

            System.out.println("Parsed userId: " + userId + ", footerYn: " + footerYn + ", headerColor: " + headerColor);

            portalMapper.updateUserSettings(userId, footerYn, headerColor);
            return ResponseEntity.ok("Settings updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating settings: " + e.getMessage());
        }
    }

    @PostMapping("/api/get-settings")
    public ResponseEntity<?> getUserSettings(@RequestBody Map<String, String> requestBody) {
        try {
            String userId = requestBody.get("userId");

            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: userId is required.");
            }

            Map<String, Object> userSettings = portalMapper.getUserSettings(userId);

            if (userSettings == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Settings not found for user: " + userId);
            }

            return ResponseEntity.ok(userSettings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving settings: " + e.getMessage());
        }
    }

    @GetMapping("/menu")
    public Map<String, Object> getMenuTreeList(@RequestParam String roleId) {

        List<PMenuDTO> menus = portalMapper.getMenuTreeList(roleId);
        Map<Integer, Map<String, Object>> menuMap = new HashMap<>();
        List<Map<String, Object>> roots = new ArrayList<>();

        List routeList = new ArrayList<>();

        for (PMenuDTO menu : menus) {
            Map<String, Object> menuItem = new HashMap<>();
            menuItem.put("menuId", menu.getMenuId());
            menuItem.put("title", menu.getTitle());
            menuItem.put("path", menu.getPath());
            menuItem.put("componentPath", menu.getComponentPath());
            menuItem.put("children", new ArrayList<>());

            if (menu.getChildYn() != null && menu.getChildYn().equals("N")) {
                routeList.add(menuItem);
            }

            menuMap.put(menu.getMenuId(), menuItem);

            if (menu.getParentMenuId() == null || menu.getParentMenuId() == 0) {
                roots.add(menuItem);
            } else {
                Map<String, Object> parent = menuMap.get(menu.getParentMenuId());
                if (parent != null) {
                    ((List<Map<String, Object>>) parent.get("children")).add(menuItem);
                }
            }
        }

        return Map.of(
                "menuInfo", roots,
                "routeInfo", routeList
        );
    }
}
