package com.siportal.portal.service;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.mapper.AdminMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/admin") // API 기본 경로
@Slf4j
public class AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @GetMapping("/api/get-user")
    public ResponseEntity<?> getUser(@RequestParam String userName) {

        try {
            List<ComResultMap> result = adminMapper.getUserByUserName(userName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/api/get-roles")
    public ResponseEntity<?> getRoles() {
        try {
            List<ComResultMap> roles = adminMapper.getAllRoles(); // 모든 권한 조회 메서드
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/api/save-roles")
    public ResponseEntity<?> saveRoles(@RequestBody List<ComResultMap> roles) {

        try {
            for (ComResultMap role : roles) {

                if (role.get("roleId") != null) {
                    adminMapper.updateRole(role); // 역할 업데이트
                } else {
                    adminMapper.insertRole(role); // 역할 삽입
                }
            }
            return ResponseEntity.ok("Roles saved successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @DeleteMapping("/api/delete-roles")
    public ResponseEntity<?> deleteRoles(@RequestBody List<String> roleIds) {

        try {
            for (String roleId : roleIds) {
                adminMapper.deleteRole(roleId);
            }
            return ResponseEntity.ok("Roles deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }
}
