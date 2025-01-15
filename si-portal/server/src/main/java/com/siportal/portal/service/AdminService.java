package com.siportal.portal.service;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.mapper.AdminMapper;
import com.siportal.portal.mapper.PortalMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/admin") // API 기본 경로
public class AdminService {

    @Autowired
    private AdminMapper adminMapper;

    @GetMapping("/api/get-email-history")
    public ResponseEntity<?> getUser(@RequestParam String sendUser) {

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

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private void saveEmailHistory(String sendUser, String sendReceiver, String title, String content) {
        String sql = "INSERT INTO dev.p_email_history (send_user, send_reciver, title, content, read_yn, creation_time) " +
                "VALUES (?, ?, ?, ?, 'N', CURRENT_TIMESTAMP)";

        // JdbcTemplate을 사용하여 데이터 삽입
        jdbcTemplate.update(sql, sendUser, sendReceiver, title, content);
    }


}
