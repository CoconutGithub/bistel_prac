package com.siportal.portal.controller;

import com.siportal.portal.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;


@RestController
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@RequestMapping("/admin") // API 기본 경로
@Transactional
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/api/get-menu-id")
    public ResponseEntity<?> getMenuId() {
        return adminService.getMenuId();
    }

    @PostMapping("/api/create-menu")
    public ResponseEntity<?> createMenu(@RequestBody(required = false) Map<String, Object> requestData) {
        return adminService.createMenu(requestData);
    }

    @GetMapping("/api/get-menu-tree")
    public ResponseEntity<?> getMenuTree4ManageMenu(@RequestParam String langCode) {
        return adminService.getMenuTree4ManageMenu(langCode);
    }

    @GetMapping("/api/get-schedule")
    public ResponseEntity<?> getScheduleList(@RequestParam String jobName, @RequestParam String status) {
        return adminService.getScheduleList(jobName, status);
    }

    @PostMapping("/api/update-schedule")
    public ResponseEntity<?> updateScheduler(@RequestBody Map<String, Object> requestData) {
        return adminService.updateScheduler(requestData);
    }

    @GetMapping("/api/get-user")
    public ResponseEntity<?> getUser(@RequestParam String userName) {
        return adminService.getUser(userName);
    }

    @PostMapping("/api/update-user")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, Object> requestData) {
        return adminService.updateUser(requestData);
    }

    @PostMapping("/api/exist-user")
    public ResponseEntity<?> existUser(@RequestBody Map<String, Object> requestData) {
        return adminService.existUser(requestData);
    }


    @GetMapping("/api/user-profile-image")
    public ResponseEntity<?> getUserProfileImage(@RequestParam("userId") String userId) {
        return adminService.getUserProfileImage(userId);
    }

    @PostMapping("/api/update-profile-image")
    public ResponseEntity<?> updateProfileImage(
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return adminService.updateProfileImage(userId, image);
    }

    @PostMapping("/api/update-phone-number")
    public ResponseEntity<?> updatePhoneNumber(
            @RequestParam("userId") String userId,
            @RequestParam("phoneNumber") String phoneNumber) {
        return adminService.updatePhoneNumber(userId, phoneNumber);
    }

    @GetMapping("/api/get-user-phone")
    public ResponseEntity<?> getUserPhoneNumber(@RequestParam("userId") String userId) {
        return adminService.getUserPhoneNumber(userId);
    }

    @PostMapping("/api/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> requestData) {
        return adminService.changePassword(requestData);
    }

    @PostMapping("/api/register-user")
    public ResponseEntity<?> registerUser(
            @RequestParam("userId") String userId,
            @RequestParam("userName") String userName,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("status") String status,
            @RequestParam("password") String password,
            @RequestParam("email") String email,
            @RequestParam("userRole") Integer userRole,
            @RequestParam(value = "langCode", required = false, defaultValue = "KO") String langCode,
            @RequestParam(value = "createBy", required = false) String createBy,
            @RequestParam(value = "image", required = false) MultipartFile image // 파일 처리
    ) {
        return adminService.registerUser(userId, userName, phoneNumber, status, password, email, userRole, image, langCode, createBy);
    }


    @GetMapping("/api/get-email-history")
    public ResponseEntity<?> getEmailHistory(@RequestParam String sendUser) {
        return adminService.getEmailHistory(sendUser);
    }


    @PostMapping("/api/send-email")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> emailData) {
        return adminService.sendEmail(emailData);
    }

    @PostMapping("/api/insert-menu")
    public ResponseEntity<?> insertMenu(@RequestBody Map<String, Object> result) {
        return adminService.insertMenu(result);
    }

    @PostMapping("/api/delete-menu")
    public ResponseEntity<?> deleteMenu(@RequestBody Map<String, Object> result) {
        return adminService.deleteMenu(result);
    }

    @PostMapping("/api/update-menu-content")
    public ResponseEntity<?> updateMenuContent(@RequestBody Map<String, Object> result) {
        return adminService.updateMenuContent(result);
    }

    @GetMapping("/api/get-roles")
    public ResponseEntity<?> getRoles(@RequestParam String roleName) {
        return adminService.getRoles(roleName);
    }

    @GetMapping("/api/get-menu-role")
    public ResponseEntity<?> getMenuRole(@RequestParam String menuIdStr) {
        return adminService.getMenuRole(menuIdStr);
    }

    @PostMapping("/api/update-menu-role")
    public ResponseEntity<?> updateMenuRole(@RequestBody Map<String, Object> requestData) {
        return adminService.updateMenuRole(requestData);
    }

    @GetMapping("/api/get-roles-list")
    public ResponseEntity<?> getRoleList() {
        return adminService.getRoleList();
    }

    @PostMapping("/api/save-roles")
    public ResponseEntity<?> saveRoles(@RequestBody Map<String, Object> payload) {
        return adminService.saveRoles(payload);
    }

    @GetMapping("/api/get-msg-type")
    public ResponseEntity<?> getMsgTypeList(@RequestParam String status) {
        return adminService.getMsgTypeList(status);
    }

    @GetMapping("/api/check-msg")
    public ResponseEntity<?> checkMsg(@RequestParam Map<String, String> params) {
        return adminService.checkMsg(params);
    }

    @GetMapping("/api/get-msg-list")
    public ResponseEntity<?> getMsgList(@RequestParam Map<String, String> params) {
        return adminService.getMsgList(params);
    }

    @GetMapping("/api/get-msg-list2")
    public ResponseEntity<?> getMsgList2() {
        Map<String, String> params = new HashMap<>();
        params.put("status", "ACTIVE");
        return adminService.getMsgList(params);
    }

    @PostMapping("/api/update-msg-list")
    public ResponseEntity<?> updateMsgList(@RequestBody Map<String, Object> requestData) {
        return adminService.updateMsgList(requestData);
    }

    @GetMapping("/api/get-lang-code")
    public ResponseEntity<?> getLangCode(@RequestParam("userId") String userId) {
        return adminService.getLangCode(userId);
    }

    @PostMapping("/api/update-lang-code")
    public ResponseEntity<?> updateLangCode(@RequestParam("userId") String userId,
                                            @RequestParam("langCode") String langCode) {
        return adminService.updateLangCode(userId, langCode);
    }

    @GetMapping("/api/get-pagination-size")
    public ResponseEntity<?> getPaginationSize(@RequestParam("userId") String userId) {
        return adminService.getPaginationSize(userId);
    }

    @PostMapping("/api/update-pagination-size")
    public ResponseEntity<?> updatePaginationSize(@RequestParam("userId") String userId,
                                                  @RequestParam("paginationSize") Integer paginationSize) {
        return adminService.updatePaginationSize(userId, paginationSize);
    }

}
