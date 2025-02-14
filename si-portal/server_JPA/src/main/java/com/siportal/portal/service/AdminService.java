package com.siportal.portal.service;

import com.siportal.portal.com.batch.config.QuartzDynamicConfig;
import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.domain.Role;
import com.siportal.portal.dto.MenuDto;
import com.siportal.portal.domain.*;
import com.siportal.portal.dto.MenuRoleDTO;
import com.siportal.portal.dto.SchedulDTO;
import com.siportal.portal.mapper.AdminMapper;
import com.siportal.portal.repository.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AdminService {

    private final AdminMapper adminMapper;
    private final JavaMailSender emailSender;
    private final TemplateEngine templateEngine;  // Thymeleaf 템플릿 엔진
    private final QuartzDynamicConfig quartzDynamicConfig;
    private final JdbcTemplate jdbcTemplate;

    //JPA
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final MenuRepository menuRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SchedulerRepository schedulerRepository;
    private final MsgMainRepository msgMainRepository;
    private final MsgDetailRepository msgDetailRepository;

    @Autowired
    public AdminService(AdminMapper adminMapper, JavaMailSender emailSender
        , TemplateEngine templateEngine, QuartzDynamicConfig quartzDynamicConfig
        , JdbcTemplate jdbcTemplate
        , UserRepository userRepository
        , UserRoleRepository userRoleRepository
        , MenuRepository menuRepository
        , RoleRepository roleRepository
        , PermissionRepository permissionRepository
        , SchedulerRepository schedulerRepository
        , MsgMainRepository msgMainRepository
        , MsgDetailRepository msgDetailRepository
    ) {
        this.adminMapper = adminMapper;
        this.emailSender = emailSender;
        this.templateEngine = templateEngine;  // Thymeleaf 템플릿 엔진
        this.quartzDynamicConfig = quartzDynamicConfig;
        this.jdbcTemplate = jdbcTemplate;

        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;

        this.menuRepository = menuRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.schedulerRepository = schedulerRepository;
        this.msgMainRepository = msgMainRepository;
        this.msgDetailRepository = msgDetailRepository;
    }

    public ResponseEntity<?> getMenuId() {
        try {
            int menuId = this.adminMapper.getMenuId();
            return ResponseEntity.ok(menuId);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> createMenu(@RequestBody(required = false) Map<String, Object> requestData) {
        try {
            List<Map<String, Object>> createList = (List<Map<String, Object>>) requestData.get("createList");
            int createdMenusCnt = 0; // 삭제된 행 갯수

            // Delete 처리
            for (Map<String, Object> menu : createList) {
                createdMenusCnt += this.adminMapper.createMenu((int)menu.get("menuId"), (String)menu.get("menuName"), (String)menu.get("menuUrl"), (int)menu.get("parentId"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            response.put("createdMenusCnt", createdMenusCnt);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getMenuTree4ManageMenu(String langCode) {
        try {
            List<MenuDto> result = this.menuRepository.getMenuTree4ManageMenu(langCode);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getMsgTypeList(@RequestParam String status) {

        try {
            List<ComResultMap> result = msgMainRepository.getMsgTypeList();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> checkMsg(@RequestParam Map<String, String> params) {
        Map<String, Object> response = new HashMap<>();

        try {
            long cnt = this.msgMainRepository.checkDupMsg(params.get("msgType"), params.get("msgName"));
            response.put("messageCode", "success");
            if(cnt > 0)
                response.put("message", "Y");
            else
                response.put("message", "N");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getMsgList(@RequestParam Map<String, String> params) {

        try {
            List<ComResultMap> result = adminMapper.getMsgList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> updateMsgList(@RequestBody Map<String, Object> requestData) {

        try {
            // 데이터 파싱
            List<Map<String, String>> updateList = (List<Map<String, String>>) requestData.get("updateList");
            List<Map<String, String>> deleteList = (List<Map<String, String>>) requestData.get("deleteList");
            List<Map<String, String>> createList = (List<Map<String, String>>) requestData.get("createList");
            String userId = (String) requestData.get("userId");

            int updatedCount = 0; // 업데이트된 행 갯수
            int deletedCount = 0; // 삭제된 행 갯수
            int createdCount = 0; // 생성된 행 갯수

            // Delete 처리
            for (Map<String, String> temp : deleteList) {
                deletedCount += msgMainRepository.deleteByMsgTypeAndMsgName(temp.get("msgType"), temp.get("msgName"));
            }

            // Create 처리
            for (Map<String, String> temp : createList) {
                if(msgMainRepository.checkDupMsg(temp.get("msgType"), temp.get("msgName")) > 0) {//중복이므로 업데이트
                    MsgMain ret = msgMainRepository.findMsgIdByMsgTypeAndMsgName(temp.get("msgType"), temp.get("msgName"));
                    temp.put("msgId", ret.getMsgId().toString());
                    temp.put("userId", userId);
                    updatedCount += msgMainRepository.updateMsgMain(temp);
                    mergeMsgDetail(temp, userId);
                } else { //신규이므로 생성
                    temp.put("userId", userId);
                    Long msgId = msgMainRepository.getSeqMsgId();
                    temp.put("msgId", msgId.toString());
                    createdCount += msgMainRepository.createMsgMain(temp);
                    mergeMsgDetail(temp, userId);
                }
            }

            // Update 처리
            for (Map<String, String> temp : updateList) {
                if(msgMainRepository.checkDupMsg(temp.get("msgType"), temp.get("msgName")) > 0) {//중복이므로 업데이트
                    temp.put("userId", userId);
                    updatedCount += msgMainRepository.updateMsgMain(temp);
                    mergeMsgDetail(temp, userId);
                } else { //신규이므로 생성
                    temp.put("userId", userId);
                    Long msgId = msgMainRepository.getSeqMsgId();
                    temp.put("msgId", msgId.toString());
                    createdCount += msgMainRepository.createMsgMain(temp);
                    mergeMsgDetail(temp, userId);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            response.put("updatedUsersCnt", updatedCount);
            response.put("deletedUsersCnt", deletedCount);
            response.put("createdUsersCnt", createdCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }
    void mergeMsgDetail(Map<String, String> params, String userId) {
        params.put("userId", userId);
        if(params.get("koLangText") != null && !params.get("koLangText").isEmpty()) {
            Map<String, String> tempMap = new HashMap<>();
            tempMap.put("msgId", String.valueOf(params.get("msgId")));
            tempMap.put("langCode", "KO");
            tempMap.put("langText", params.get("koLangText"));
            tempMap.put("userId", userId);
            if(msgDetailRepository.checkMsgTextExist(tempMap) > 0) {
                msgDetailRepository.updateMsgDetail(tempMap);
            } else {
                // MsgDetail 객체 생성
                MsgDetail msgDetail = new MsgDetail();
                msgDetail.setMsgId(Integer.parseInt(tempMap.get("msgId")));
                msgDetail.setLangCode(tempMap.get("langCode"));
                msgDetail.setLangText(tempMap.get("langText"));
                msgDetail.setCreateBy(userId);
                msgDetail.setCreateDate(LocalDateTime.now());
                // MsgDetail 저장
                msgDetailRepository.save(msgDetail);
            }
        }
        if(params.get("enLangText") != null && !params.get("enLangText").isEmpty()) {
            Map<String, String> tempMap = new HashMap<>();
            tempMap.put("msgId", String.valueOf(params.get("msgId")));
            tempMap.put("langCode", "EN");
            tempMap.put("langText", params.get("enLangText"));
            tempMap.put("userId", userId);
            if(msgDetailRepository.checkMsgTextExist(tempMap) > 0) {
                msgDetailRepository.updateMsgDetail(tempMap);
            } else {
                // MsgDetail 객체 생성
                MsgDetail msgDetail = new MsgDetail();
                msgDetail.setMsgId(Integer.parseInt(tempMap.get("msgId")));
                msgDetail.setLangCode(tempMap.get("langCode"));
                msgDetail.setLangText(tempMap.get("langText"));
                msgDetail.setCreateBy(userId);
                msgDetail.setCreateDate(LocalDateTime.now());
                // MsgDetail 저장
                msgDetailRepository.save(msgDetail);
            }
        }
        if(params.get("cnLangText") != null && !params.get("cnLangText").isEmpty()) {
            Map<String, String> tempMap = new HashMap<>();
            tempMap.put("msgId", String.valueOf(params.get("msgId")));
            tempMap.put("langCode", "CN");
            tempMap.put("langText", params.get("cnLangText"));
            tempMap.put("userId", userId);
            if(msgDetailRepository.checkMsgTextExist(tempMap) > 0) {
                msgDetailRepository.updateMsgDetail(tempMap);
            } else {
                // MsgDetail 객체 생성
                MsgDetail msgDetail = new MsgDetail();
                msgDetail.setMsgId(Integer.parseInt(tempMap.get("msgId")));
                msgDetail.setLangCode(tempMap.get("langCode"));
                msgDetail.setLangText(tempMap.get("langText"));
                msgDetail.setCreateBy(userId);
                msgDetail.setCreateDate(LocalDateTime.now());
                // MsgDetail 저장
                msgDetailRepository.save(msgDetail);
            }
        }
    }

    public ResponseEntity<?> getScheduleList(@RequestParam String jobName, @RequestParam String status) {

        try {
            List<Scheduler> result = this.schedulerRepository.getScheduleList(jobName, status);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

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
//                    adminMapper.deleteSchedule((String) job.get("jobName"), (String) job.get("groupName"));
                    schedulerRepository.deleteByJobName((String) job.get("jobName"));
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
//                        adminMapper.createSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
//                                , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
//                                , userId);
                        schedulerRepository.createSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
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
                            schedulerRepository.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
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
                            schedulerRepository.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
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
                        schedulerRepository.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
                                , (String) job.get("className"), (String) job.get("cronTab"), (String) job.get("status")
                                , userId);
                    }
                    else {
                        errorList.add((String) job.get("jobName"));
                    }
                } else {
                    schedulerRepository.updateSchedule((String) job.get("jobName"), (String) job.get("groupName"), (String) job.get("triggerKey")
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

    public ResponseEntity<?> getUser(@RequestParam String userName) {

        try {
            //[JPA]
            List<ComResultMap> result = null;
            if (userName.trim().isEmpty()) {
                result = this.userRepository.getUserAll();
            } else {
                result = this.userRepository.getUserByUserName(userName);
                System.out.println("USER Query Result: " + result);
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @Transactional
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

                User userObj = userRepository.findByUserId((String)user.get("userId"))
                        .orElseThrow(() -> new RuntimeException("User not found"));

                userObj.setUserName((String)user.get("userName"));
                userObj.setPhoneNumber((String)user.get("phoneNumber"));
                userObj.setStatus((String)user.get("status"));
                userObj.setEmail((String)user.get("email"));
                userObj.setUpdateBy("system");
                userObj.setUpdateDate(LocalDateTime.now());


                userRoleRepository.updateRoleId(
                        (String)user.get("userId")
                        , (Integer)user.get("roleId")
                );


                updatedCount++;
            }

            // Delete 처리
            for (Map<String, Object> user : deleteList) {
                System.out.println("DELETE USER: " + user.get("userId"));

                //JPA
                userRepository.deleteByUserId((String)user.get("userId"));
                userRoleRepository.deleteByUserId((String)user.get("userId"));

                deletedCount++;
            }

            Map<String, Object> response = new HashMap<>();
            response.put("messageCode", "success");
            response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
            response.put("updatedUsersCnt", updatedCount);
            response.put("deletedUsersCnt", deletedCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> existUser(@RequestBody Map<String, Object> requestData) {

        try {
            String userId = (String) requestData.get("userId");
            boolean exist = userRepository.existsByUserId(userId);

            Map<String, Object> response = new HashMap<>();

            if (exist) {
                response.put("success", false);
                response.put("message", "User ID is not available for creation.");
            } else {
                response.put("success", true);
                response.put("message", "User ID is available for creation.");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getUserProfileImage(@RequestParam("userId") String userId) {
        try {
            // DB에서 사용자 정보 조회
            Optional<byte[]> profileImageOpt = userRepository.findUserProfileImageByUserId(userId);

            if (profileImageOpt.isPresent() && profileImageOpt.get().length > 0) {
                String base64Image = Base64.getEncoder().encodeToString(profileImageOpt.get());
                return ResponseEntity.ok(Collections.singletonMap("profileImage", base64Image));
            } else {
                // 기본 이미지 경로 반환 (예: /images/default-profile.png)
                return ResponseEntity.ok(Collections.singletonMap("profileImage", "/images/default-profile.png"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred");
        }
    }

    @Transactional
    public ResponseEntity<?> updateProfileImage(String userId, MultipartFile image) {
        try {
            Optional<User> userOpt = userRepository.findByUserId(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            User user = userOpt.get();

            if (image != null && !image.isEmpty()) {
                user.setProfileImage(image.getBytes());
            }
            // 기존 값을 유지하도록 수정: 이미지가 null이면 변경하지 않음
            userRepository.save(user);

            return ResponseEntity.ok(Collections.singletonMap("message", "프로필 이미지 업데이트 완료"));
        } catch (Exception e) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> updatePhoneNumber(String userId, String phoneNumber) {
        try {
            User user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setPhoneNumber(phoneNumber);

            return ResponseEntity.ok(Collections.singletonMap("message", "전화번호가 업데이트되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body(Collections.singletonMap("error", "전화번호 업데이트 실패: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getUserPhoneNumber(@RequestParam("userId") String userId) {
        try {
            Map<String, Object> user = adminMapper.getUserPhoneNumber(userId);
            if (user == null || user.get("phoneNumber") == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("phoneNumber", ""));
            }
            String phoneNumber = (String) user.get("phonenumber");
            Map<String, Object> response = new HashMap<>();
            response.put("phoneNumber", phoneNumber); // 일관된 키 사용

            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "전화번호 불러오기 실패"));
        }
    }


    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> requestData) {
        try {
            String userId = requestData.get("userId");
            String newPassword = requestData.get("newPassword");

            // 비밀번호 암호화
            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String encodedPassword = passwordEncoder.encode(newPassword);

            // DB 업데이트
//            Map<String, Object> userMap = new HashMap<>();
//            userMap.put("userId", userId);
//            userMap.put("password", encodedPassword);
//            adminMapper.updateUserPassword(userMap);

            Optional<User> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // 비밀번호 변경 후 저장
            User user = userOpt.get();
            user.setPassword(encodedPassword);
//            userRepository.save(user);  // 변경된 내용 자동 반영

            return ResponseEntity.ok(Collections.singletonMap("message", "비밀번호 변경이 완료되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("비밀번호 변경 중 오류 발생: " + e.getMessage());
        }
    }


    @Transactional
    public ResponseEntity<?> registerUser(
            @RequestParam("userId") String userId,
            @RequestParam("userName") String userName,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("status") String status,
            @RequestParam("password") String password,
            @RequestParam("email") String email,
            @RequestParam("userRole") Integer userRole,
            @RequestParam(value = "image", required = false) MultipartFile image, // 파일 처리
            @RequestParam(value = "langCode", required = false, defaultValue = "KO") String langCode,
            @RequestParam("createBy") String createBy
    ) {

        try {
            //JPA-User 저장
            User userObj = new User();
            userObj.setUserId(userId);
            userObj.setUserName(userName);
            userObj.setPhoneNumber(phoneNumber);
            userObj.setStatus(status);
            userObj.setPassword(password);
            userObj.setEmail(email);
            userObj.setLangCode(langCode);
            userObj.setCreateBy(createBy);
            userObj.setCreateDate(LocalDateTime.now());

            // 파일을 DB의 bytea 컬럼에 저장
            if (image != null && !image.isEmpty()) {
                byte[] imageBytes = image.getBytes(); // 파일을 byte[]로 변환
                userObj.setProfileImage(imageBytes);
            } else {
                userObj.setProfileImage(null); // 이미지가 없으면 null 저장
            }

            userRepository.save(userObj);

            //JPA-UserRole 저장
            UserRole userRoleObj = new UserRole();
            userRoleObj.setUserId(userId);
            userRoleObj.setRoleId(userRole);
            userRoleRepository.save(userRoleObj);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User has been successfully registered.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }


    public ResponseEntity<?> getEmailHistory(@RequestParam String sendUser) {

        try {
            List<ComResultMap> result = this.adminMapper.getEmailHistory(sendUser);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }


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

    public ResponseEntity<?> insertMenu(@RequestBody Map<String, Object> result) {
        try {
            Menu menu = new Menu();
            menu.setMenuName((String)result.get("menuName"));
            menu.setParentMenuId((Integer)result.get("parentMenuId"));
            menu.setDepth((Integer)result.get("depth"));
            menu.setPath((String)result.get("path"));
            menu.setPosition((Integer)result.get("position"));
            menu.setChildYn((String)result.get("childYn"));
            menu.setStatus((String)result.get("status"));
            menu.setCreateBy((String)result.get("userId"));
            menu.setCreateDate(LocalDateTime.now());
            menuRepository.save(menu);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> deleteMenu(@RequestBody Map<String, Object> result) {
        try {
            Integer menuId = (Integer) result.get("menuId");
            permissionRepository.deleteMenu(menuId);
            menuRepository.deleteByMenuId(menuId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> updateMenuContent(Map<String, Object> result) {
        try {
            // position 값이 있을 경우 이를 integer로 변환
            if (result.containsKey("position")) {
                Object positionObj = result.get("position");
                if (positionObj instanceof String) {
                    // position이 문자열인 경우 Integer로 변환
                    int position = Integer.parseInt((String) positionObj);
                    result.put("position", position); // 변환된 값을 다시 result에 설정
                }
            }

            // updateMenuContent 메서드를 호출하여 메뉴 업데이트
            int updateCount = menuRepository.updateMenuContent(
                    (Integer) result.get("menuId"),
                    (String) result.get("menuName"),
                    (String) result.get("path"),
                    (Integer) result.get("position"),
                    (String) result.get("status"),
                    (String) result.get("userId"),
                    (Integer) result.get("msgId")
            );

            if (updateCount > 0) {
                return ResponseEntity.ok(result); // 성공적으로 업데이트된 경우
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu not found for the given ID");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }



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

    public ResponseEntity<?> getRoles(@RequestParam String roleName) {
        try {
            List<ComResultMap> roles = adminMapper.getAllRoles(roleName); // 모든 권한 조회 메서드
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getMenuRole(@RequestParam String menuIdStr) {
        try {
            Integer menuId = Integer.parseInt(menuIdStr);
            List<MenuRoleDTO> roles = menuRepository.getMenuRole(menuId); // JPA 적용된 쿼리 실행

            if (roles.isEmpty()) {
                return ResponseEntity.ok("조회된 데이터가 없습니다");
            }
            return ResponseEntity.ok(roles);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid menuId format: " + menuIdStr);
        } catch (Exception e) {
                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> updateMenuRole(Map<String, Object> requestData) {
        try {
            // 데이터 파싱
            List<Map<String, Object>> createList = (List<Map<String, Object>>) requestData.get("createList");
            List<Map<String, Object>> updateList = (List<Map<String, Object>>) requestData.get("updateList");
            List<Map<String, Object>> deleteList = (List<Map<String, Object>>) requestData.get("deleteList");

            // Create 처리
            for (Map<String, Object> role : createList) {
                permissionRepository.createMenuRole(
                        (Integer) role.get("roleId"),
                        (Integer) role.get("menuId"),
                        (String) role.get("canCreate"),
                        (String) role.get("canRead"),
                        (String) role.get("canUpdate"),
                        (String) role.get("canDelete")
                );
            }

            // Update 처리
            for (Map<String, Object> role : updateList) {
                permissionRepository.updateMenuRole(
                        (Integer) role.get("permissionId"),
                        (Integer) role.get("roleId"),
                        (Integer) role.get("menuId"),
                        (String) role.get("canCreate"),
                        (String) role.get("canRead"),
                        (String) role.get("canUpdate"),
                        (String) role.get("canDelete")
                );
            }

            // Delete 처리
            for (Map<String, Object> role : deleteList) {
                permissionRepository.deleteMenuRole(
                        (Integer) role.get("permissionId"),
                        (Integer) role.get("roleId"),
                        (Integer) role.get("menuId")
                );
            }

            Map<String, Object> response = Map.of(
                    "messageCode", "success",
                    "message", "모든 작업이 성공적으로 처리되었습니다."
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    public ResponseEntity<?> getRoleList() {
        try {
            List<ComResultMap> roles = adminMapper.getRoleList(); // 모든 권한 조회 메서드
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body("Error occurred: " + e.getMessage());
        }
    }

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

    public ResponseEntity<?> getLangCode(String userId) {
        try {
            Optional<User> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            String langCode = userOpt.get().getLangCode();
            return ResponseEntity.ok(Collections.singletonMap("langCode", langCode));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<?> updateLangCode(String userId, String langCode) {
        try {
            User user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setLangCode(langCode);

            return ResponseEntity.ok(Collections.singletonMap("message", "언어 코드가 업데이트되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body(Collections.singletonMap("error", "언어 코드 업데이트 실패: " + e.getMessage()));
        }
    }

    public ResponseEntity<?> getPaginationSize(@RequestParam("userId") String userId) {
        try {
            Optional<User> userOpt = userRepository.findByUserId(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            Integer paginationSize = userOpt.get().getPaginationSize();
            return ResponseEntity.ok(Collections.singletonMap("paginationSize", paginationSize));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error occurred: " + e.getMessage());
        }
    }

    @Transactional
    public ResponseEntity<?> updatePaginationSize(String userId, Integer paginationSize) {
        try {
            User user = userRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setPaginationSize(paginationSize);

            return ResponseEntity.ok(Collections.singletonMap("message", "페이지네이션 크기가 업데이트되었습니다."));
        } catch (Exception e) {
            e.printStackTrace();
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
                    .body(Collections.singletonMap("error", "페이지네이션 크기 업데이트 실패: " + e.getMessage()));
        }
    }

}
