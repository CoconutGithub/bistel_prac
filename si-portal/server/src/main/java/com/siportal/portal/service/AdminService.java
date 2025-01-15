package com.siportal.portal.service;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.mapper.AdminMapper;
import com.siportal.portal.mapper.PortalMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/admin") // API 기본 경로
public class AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @GetMapping("/api/get-user")
    public ResponseEntity<?> getUser(@RequestParam String userName) {

        try {
            List<ComResultMap> result = this.adminMapper.getUserByUserName(userName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }
}
