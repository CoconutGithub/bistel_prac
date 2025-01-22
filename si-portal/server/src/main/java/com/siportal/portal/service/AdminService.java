package com.siportal.portal.service;

import com.siportal.portal.com.batch.config.QuartzDynamicConfig;
import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.SchedulDTO;
import com.siportal.portal.mapper.AdminMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/admin") // API 기본 경로
@Transactional
@Slf4j
public class AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private TemplateEngine templateEngine;  // Thymeleaf 템플릿 엔진

    @Autowired
    QuartzDynamicConfig quartzDynamicConfig;

    @GetMapping("/api/get-menu-tree")
    public ResponseEntity<?> getMenuTree() {
        try {
            List<ComResultMap> result = this.adminMapper.getMenuTree();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/api/get-schedule")
    public ResponseEntity<?> getScheduleList(@RequestParam String jobName, @RequestParam String status) {

        try {
            List<SchedulDTO> result = this.adminMapper.getScheduleList(jobName, status);
            //스케줄잡 Quartz 삭제 업데이트 테스트 임시
//            for(SchedulDTO dto : result) {
//                if(dto.getJobName().equals("dynamicJob")) {
//                    quartzDynamicConfig.deleteJob(dto.getJobName(), dto.getGroupName());
//                    quartzDynamicConfig.updateJobTrigger(dto.getTriggerKey(), "0/2 * * * * ?");
//                }
//            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }
    @PostMapping("/api/update-schedule")
    public ResponseEntity<?> updateScheduler(@RequestBody Map<String, Object> requestData) {

        try {
            // 데이터 파싱
            List<Map<String, Object>> updateList = (List<Map<String, Object>>) requestData.get("updateList");
            List<Map<String, Object>> deleteList = (List<Map<String, Object>>) requestData.get("deleteList");
            List<Map<String, Object>> createList = (List<Map<String, Object>>) requestData.get("createList");
            String userId = (String) requestData.get("userId");

            ArrayList<String> errorList = new ArrayList<String>();

            // Delete 처리
            for (Map<String, Object> job : deleteList) {
                System.out.println("DELETE JOB: " + job.get("jobName"));
                if (quartzDynamicConfig.deleteJob((String) job.get("jobName"), (String) job.get("groupName"))) {
                    adminMapper.deleteSchedule((String) job.get("jobName"), (String) job.get("groupName"));
                }
                else {
                    errorList.add((String) job.get("jobName"));
                }
            }

            // Create 처리
            for (Map<String, Object> job : createList) {
                System.out.println("CREATE JOB: " + job.get("jobName"));
                try {
                    if (quartzDynamicConfig.addJob((String) job.get("className"), (String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey"), (String) job.get("cronTab"))) {
                        adminMapper.createSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
                                , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
                                , userId);
                    }
                    else {
                        errorList.add((String) job.get("jobName"));
                    }
                } catch (Exception e) {
                    errorList.add((String) job.get("jobName"));
                }
            }

            // Update 처리
            for (Map<String, Object> job : updateList) {
                System.out.println("UPDATE JOB: " + job.get("jobName"));
                System.out.println("changeCron: " + job.get("changeCron"));
                System.out.println("changeStatus: " + job.get("changeStatus"));

                if("N".equals((String)job.get("changeStatus")) && "ACTIVE".equals((String) job.get("status"))) {
                    try {
                        if (quartzDynamicConfig.updateJobTrigger((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey"), (String) job.get("cronTab"))) {
                            adminMapper.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
                                    , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
                                    , userId);
                        }
                        else {
                            errorList.add((String) job.get("jobName"));
                        }
                    } catch (Exception e) {
                        errorList.add((String) job.get("jobName"));
                    }
                } else if ("Y".equals((String)job.get("changeStatus")) && "ACTIVE".equals((String) job.get("status"))){
                    try {
                        if (quartzDynamicConfig.addJob((String) job.get("className"), (String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey"), (String) job.get("cronTab"))) {
                            adminMapper.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
                                    , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
                                    , userId);
                        }
                        else {
                            errorList.add((String) job.get("jobName"));
                        }
                    } catch (Exception e) {
                        errorList.add((String) job.get("jobName"));
                    }
                } else if ("Y".equals((String)job.get("changeStatus")) && "INACTIVE".equals((String) job.get("status"))){
                    if (quartzDynamicConfig.deleteJob((String) job.get("jobName"), (String) job.get("groupName"))) {
                        adminMapper.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
                                , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
                                , userId);
                    }
                    else {
                        errorList.add((String) job.get("jobName"));
                    }
                } else {
                    adminMapper.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
                            , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
                            , userId);
                }
            }

            Map<String, Object> response = new HashMap<>();
            if(!errorList.isEmpty()) {
                response.put("messageCode", "error");
                response.put("message", "작업 중 오류가 발생한 스케줄이 있습니다.");
                response.put("errorList", errorList);
            }
            else {
                response.put("messageCode", "success");
                response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

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

    @GetMapping("/api/get-email-history")
    public ResponseEntity<?> getEmailHistory(@RequestParam String sendUser) {

        try {
            List<ComResultMap> result = this.adminMapper.getEmailHistory(sendUser);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }


    @PostMapping("/api/send-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> emailData) {
        String sendUser = emailData.get("sendUser");
        String email = emailData.get("email");
        String subject = emailData.get("subject");
        String message = emailData.get("message");

        // Thymeleaf 템플릿 렌더링
        Context context = new Context();
        context.setVariable("subject", subject);
        context.setVariable("message", message);

        // manageEmail.html 템플릿을 사용하여 HTML 콘텐츠 생성
        String htmlContent = templateEngine.process("manageEmail.html", context);

        try {
            MimeMessage mimeMessage = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);  // true는 HTML 콘텐츠 지원

            helper.setFrom("youngw2354@gmail.com");  // 보내는 사람 이메일 주소
            helper.setTo(email);                       // 받는 사람 이메일 주소
            helper.setSubject(subject);                // 이메일 제목
            helper.setText(htmlContent, true);         // HTML 콘텐츠 설정

            // 메일 발송
            emailSender.send(mimeMessage);

            // 이메일 기록을 DB에 저장
            saveEmailHistory(sendUser, email, subject, message);

            return ResponseEntity.ok("Email sent successfully.");
        } catch (MessagingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sending email: " + e.getMessage());
        }
    }

//    @PostMapping("/api/save-role")
//    public ResponseEntity<?> saveRole(@RequestBody Map<String, String> roleData) {
//        String roleName = roleData.get("roleName");
//        String status = roleData.get("status");
//        String userName = roleData.get("userName");
//
//        saveRoleList(roleName, status, userName);
//        return ResponseEntity.ok("Email sent successfully.");
//    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private void saveEmailHistory(String sendUser, String sendReceiver, String title, String content) {
        String sql = "INSERT INTO dev.p_email_history (send_user, send_reciver, title, content, read_yn, creation_time) " +
                "VALUES (?, ?, ?, ?, 'N', CURRENT_TIMESTAMP)";

        // JdbcTemplate을 사용하여 데이터 삽입
        jdbcTemplate.update(sql, sendUser, sendReceiver, title, content);
    }

    private void saveRoleList(String roleName, String status, String userName) {
        String sql = "INSERT INTO dev.p_role (role_id, role_name, status, create_date, create_by) " +
                "VALUES (nextval('seq_p_role'), ?, ?, CURRENT_TIMESTAMP, ?)";

        // JdbcTemplate을 사용하여 데이터 삽입
        jdbcTemplate.update(sql, roleName, status, userName);
    }

    @GetMapping("/api/get-roles")
    public ResponseEntity<?> getRoles(@RequestParam String roleName) {
        try {
            List<ComResultMap> roles = adminMapper.getAllRoles(roleName); // 모든 권한 조회 메서드
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/api/get-roles-list")
    public ResponseEntity<?> getRoleList() {
        try {
            List<ComResultMap> roles = adminMapper.getRoleList(); // 모든 권한 조회 메서드
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/api/save-roles")
    public ResponseEntity<?> saveRoles(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Payload: {}", payload);

            int updatedCount = 0; // 업데이트된 행 갯수
            int insertedCount = 0; // 삽입된 행 갯수
            int deletedCount = 0; // 삭제된 행 갯수

            // 1. 삭제 처리
            List<?> deleteListObj  = (List<?>) payload.get("deleteList");

            if (deleteListObj != null && !deleteListObj.isEmpty()) {
                List<Integer> roleIds = deleteListObj.stream()
                        .filter(obj -> obj instanceof Number)
                        .map(obj -> ((Number) obj).intValue())
                        .collect(Collectors.toList());
                log.info("Role IDs to delete: {}", roleIds);
                deletedCount = adminMapper.deleteRoles(roleIds); // 다중 삭제
                log.info("Deleted rows count: {}", deletedCount);
            }

            // 2. 업데이트 및 삽입 처리
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> updateList = (List<Map<String, Object>>) payload.get("updateList");
            if (updateList != null && !updateList.isEmpty()) {
                for (Map<String, Object> item : updateList) {
                    Object roleIdObj = item.get("roleId");
                    Integer roleId = null;
                    if (roleIdObj != null) {
                        if (roleIdObj instanceof Number) {
                            roleId = ((Number) roleIdObj).intValue();
                        } else if (roleIdObj instanceof String) {
                            try {
                                roleId = Integer.parseInt((String) roleIdObj);
                            } catch (NumberFormatException e) {
                                roleId = null;
                            }
                        }
                    }
                    String roleName = item.get("roleName").toString();
                    String status = item.get("status").toString();

                    if (roleId != null) {
                        // 기존 역할 업데이트
                        Map<String, Object> roleMap = new HashMap<>();
                        roleMap.put("roleId", roleId);
                        roleMap.put("roleName", roleName);
                        roleMap.put("status", status);

                        int updated = adminMapper.updateRole(roleMap);
                        if (updated > 0) {
                            updatedCount += updated;
                            log.info("Successfully updated role with ID: {}", roleId);
                        } else {
                            // 업데이트 실패 시 처리 (옵션)
                            log.warn("Failed to update role with ID: " + roleId);
                        }
                    } else {
                        // 새 역할 삽입
                        Map<String, Object> roleMap = new HashMap<>();
                        roleMap.put("roleName", roleName);
                        roleMap.put("status", status);

                        int inserted = adminMapper.insertRole(roleMap);
                        if (inserted > 0) {
                            insertedCount += inserted;
                            log.info("Successfully inserted new role: {}", roleName);
                        } else {
                            log.warn("Failed to insert new role: {}", roleName);
                        }
                    }
                }
            }

            // 3. 응답 데이터 생성
            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            response.put("updatedUsersCnt", updatedCount);
            response.put("insertedUsersCnt", insertedCount);
            response.put("deletedUsersCnt", deletedCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred while saving roles: " + e.getMessage());
        }
    }


}
