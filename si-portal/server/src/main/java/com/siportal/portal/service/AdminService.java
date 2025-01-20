package com.siportal.portal.service;

import com.siportal.portal.com.ComPortalData;
import com.siportal.portal.com.ComPortalDataLoader;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/admin") // API 기본 경로
@Transactional
@Slf4j
public class AdminService {

    @Autowired
    private AdminMapper adminMapper;
    @Autowired
    private ComPortalDataLoader dataLoader;

    @Autowired
    QuartzDynamicConfig quartzDynamicConfig;

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

            int updatedCount = 0; // 업데이트된 행 갯수
            int deletedCount = 0; // 삭제된 행 갯수
            int createdCount = 0; // 추가된 행 갯수

            // Delete 처리
            for (Map<String, Object> job : deleteList) {
                System.out.println("DELETE JOB: " + job.get("jobName"));
                if (quartzDynamicConfig.deleteJob((String) job.get("jobName"), (String) job.get("groupName"))) {
                    deletedCount += adminMapper.deleteSchedule((String) job.get("jobName"), (String) job.get("groupName"));
                }
            }

            // Create 처리
            for (Map<String, Object> job : createList) {
                System.out.println("CREATE JOB: " + job.get("jobName"));

                createdCount += adminMapper.createSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
                                                            , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
                                                            , (String) job.get("createBy") );
            }

            // Update 처리
//            for (Map<String, Object> job : updateList) {
//                System.out.println( user);
//
//                adminMapper.updateUser(user);
//                updatedCount += adminMapper.updateUserRole(user);
//            }

            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            response.put("updatedCnt", updatedCount);
            response.put("deletedCnt", deletedCount);
            response.put("createdCnt", createdCount);

            return ResponseEntity.ok(null);
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

    @PostMapping("/api/update-permission")
    public ResponseEntity<?> updateUserRole(@RequestBody Map<String, Object> requestData) {

        try {
            // 데이터 파싱
            List<Map<String, Object>> updateList = (List<Map<String, Object>>) requestData.get("updateList");
            List<Map<String, Object>> deleteList = (List<Map<String, Object>>) requestData.get("deleteList");

            int updatedCount = 0; // 업데이트된 행 갯수
            int deletedCount = 0; // 삭제된 행 갯수

            // Update 처리
            for (Map<String, Object> permission : updateList) {
                adminMapper.updatePermission(permission);
            }

            // Delete 처리
            for (Map<String, Object> permissionId : deleteList) {
                adminMapper.deletePermission((Integer)permissionId.get("permissionId"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
//            response.put("updatedUsersCnt", updatedCount);
//            response.put("deletedUsersCnt", deletedCount);

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

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private TemplateEngine templateEngine;  // Thymeleaf 템플릿 엔진

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

    @PostMapping("/api/save-role")
    public ResponseEntity<?> saveRole(@RequestBody Map<String, String> roleData) {
        String roleName = roleData.get("roleName");
        String status = roleData.get("status");
        String userName = roleData.get("userName");

        saveRoleList(roleName, status, userName);
        return ResponseEntity.ok("Email sent successfully.");
    }

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
