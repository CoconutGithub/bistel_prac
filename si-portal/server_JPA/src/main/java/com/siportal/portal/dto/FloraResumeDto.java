package com.siportal.portal.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.Optional;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class FloraResumeDto {

    private Integer id;

    private String fullName;
    private String email;

    @Builder.Default
    private String phone = "";
    @Builder.Default
    private String summary= "";

    @Builder.Default
    private List<?> experience = new ArrayList<>();
    @Builder.Default
    private List<?> education = new ArrayList<>();
    @Builder.Default
    private List<?> skills = new ArrayList<>();

    @Builder.Default
    private Optional<byte[]> resumeFile = Optional.empty();

    @Builder.Default
    private String resumeFilename = "";

    @Builder.Default
    private LocalDateTime createDate = LocalDateTime.now();

    @Builder.Default
    private String createBy = "system";

    @Builder.Default
    private LocalDateTime updateDate = null;

    @Builder.Default
    private String updateBy = "";

    @Builder.Default
    private String gender = "";

    @Builder.Default
    private String company = "";

    @Builder.Default
    private String department = "";

    @Builder.Default
    private String position = "";

    @Builder.Default
    private String jobTitle = "";
}
