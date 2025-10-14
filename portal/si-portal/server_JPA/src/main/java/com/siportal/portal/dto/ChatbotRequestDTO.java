package com.siportal.portal.dto;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.*;

//@Getter
//@Setter
//@NoArgsConstructor
//public class ChatbotRequestDTO {
//
//    @Schema(description = "question example", example = "배우자의 자매 또는 형제가 결혼할 경우 경조사 지원을 받을 수 있어?")
//    private String question;
//}

public class ChatbotRequestDTO {
    private String question;

    public ChatbotRequestDTO() {}

    public ChatbotRequestDTO(String question) {
        this.question = question;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
