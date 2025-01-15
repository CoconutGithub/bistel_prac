package com.siportal.portal.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.internet.MimeMessage;
import com.siportal.portal.com.result.ComResultMap;
import jakarta.mail.MessagingException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Autowired
    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    /**
     * 이메일을 전송하는 메소드
     *
     * @param to 이메일 수신자
     * @param subject 이메일 제목
     * @param message 이메일 내용
     * @return 이메일 전송 결과
     */
    public ComResultMap sendEmail(String to, String subject, String message) {
        ComResultMap result = new ComResultMap();

        try {
            // Thymeleaf 컨텍스트 생성
            Context context = new Context();
            context.setVariable("subject", subject);
            context.setVariable("message", message);  // message 변수에 HTML 포함

            // 템플릿 처리
            String htmlContent = templateEngine.process("manageEmail", context);
            System.out.println("Generated HTML content: " + htmlContent);  // 디버깅용 출력

            // 이메일 내용 작성
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

            // 이메일 설정
            helper.setTo(to);  // 수신자
            helper.setSubject(subject);  // 제목
            helper.setText(htmlContent, true);  // HTML로 메시지 설정

            // 이메일 전송
            mailSender.send(mimeMessage);

            // 성공적으로 이메일이 전송되었음을 결과에 기록
            result.put("status", "success");
            result.put("message", "Email sent successfully!");
        } catch (MessagingException e) {
            result.put("status", "failure");
            result.put("message", "Failed to send email");
        }

        return result;
    }
}
