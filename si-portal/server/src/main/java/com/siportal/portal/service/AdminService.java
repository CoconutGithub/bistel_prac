package com.siportal.portal.service;

import com.siportal.portal.com.ComPortalData;
import com.siportal.portal.com.ComPortalDataLoader;
import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.mapper.AdminMapper;
import com.siportal.portal.mapper.PortalMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/admin") // API 기본 경로
@Transactional
public class AdminService {

    @Autowired
    private AdminMapper adminMapper;
    @Autowired
    private ComPortalDataLoader dataLoader;

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

    @PostMapping("/api/update-user")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, Object> requestData) {

        try {
            // 데이터 파싱
            List<Map<String, Object>> updateList = (List<Map<String, Object>>) requestData.get("updateList");
            List<Map<String, Object>> deleteList = (List<Map<String, Object>>) requestData.get("deleteList");

            int updatedCount = 0; // 업데이트된 행 갯수
            int deletedCount = 0; // 삭제된 행 갯수

            // Update 처리
            for (Map<String, Object> user : updateList) {
                System.out.println( user);

                //아침에 와서 여기 넣어라..


                adminMapper.updateUser(user);
                updatedCount += adminMapper.updateUserRole(user);
            }

            // Delete 처리
            for (Map<String, Object> user : deleteList) {
                System.out.println("DELETE USER: " + user.get("userId"));

                adminMapper.deleteUser((String)user.get("userId"));
                deletedCount += adminMapper.deleteUserRole((String)user.get("userId"));

//                adminMapper.deleteUserInfo((String)user.get("userId"));
//                deletedCount++;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            response.put("updatedUsersCnt", updatedCount);
            response.put("deletedUsersCnt", deletedCount);

            return ResponseEntity.ok(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }
}
