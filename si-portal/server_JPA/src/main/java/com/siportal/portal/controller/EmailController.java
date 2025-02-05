package com.siportal.portal.controller;

import com.siportal.portal.service.EmailService;
import com.siportal.portal.com.result.ComResultMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    @Autowired
    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * 이메일 전송 API
     *
     * @param emailData 이메일 데이터 (email, subject, message)
     * @return 이메일 전송 결과
     */
    @PostMapping("/send")
    public ComResultMap sendEmail(@RequestBody EmailData emailData) {
        // 이메일 전송 서비스 호출
        return emailService.sendEmail(emailData.getEmail(), emailData.getSubject(), emailData.getMessage());
    }

    // 이메일 데이터를 받아오는 DTO
    public static class EmailData {
        private String email;
        private String subject;
        private String message;

        // Getter & Setter
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
