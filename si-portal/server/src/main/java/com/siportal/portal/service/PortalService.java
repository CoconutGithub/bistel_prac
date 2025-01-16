package com.siportal.portal.service;

import com.siportal.portal.com.auth.JwtUtils;
import com.siportal.portal.com.batch.config.QuartzDynamicConfig;
import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.PMenuDTO;
import com.siportal.portal.dto.SchedulDTO;
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

    @Autowired
    QuartzDynamicConfig quartzDynamicConfig;

    @GetMapping("/api/get-schedule")
    public ResponseEntity<?> getScheduleList(@RequestParam String jobName, @RequestParam String status) {

        try {
            List<SchedulDTO> result = this.portalMapper.getScheduleList(jobName, status);
            for(SchedulDTO dto : result) {
                if(dto.getJobName().equals("dynamicJob")) {
//                    quartzDynamicConfig.deleteJob(dto.getJobName(), dto.getGroupName());
                    quartzDynamicConfig.updateJobTrigger(dto.getTriggerKey(), "0/2 * * * * ?");
                }
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

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

    @PostMapping("/api/update-user")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, String> requestBody) {

        try {
            System.out.println("ddddddddddddddddddddddd");
//            List<ComResultMap> result = this.portalMapper.getUserByUserName(userName);
            return ResponseEntity.ok(null);
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

    @GetMapping("/menu")
    public Map<String, Object> getMenuTreeList() {
        List<PMenuDTO> menus = portalMapper.getMenuTreeList();
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
