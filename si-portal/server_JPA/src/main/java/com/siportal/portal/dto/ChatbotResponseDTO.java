package com.siportal.portal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
public class ChatbotResponseDTO {
    private Answer answer;
    @Getter
    @Setter
    public static class Answer {
        private String query;
        private String result;
        @JsonProperty("source_documents")
        private List<SourceDocument> source_documents;
    }
    @Getter
    @Setter
    public static class SourceDocument {
        private String id;
        private Map<String, Object> metadata;
    }
    }
