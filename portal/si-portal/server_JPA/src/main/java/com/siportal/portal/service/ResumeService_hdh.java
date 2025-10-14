package com.siportal.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.domain.Resume_hdh;
import com.siportal.portal.dto.ResumeDTO_hdh;
import com.siportal.portal.repository.ResumeRepository_hdh;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResumeService_hdh {

    private final ResumeRepository_hdh resumeRepository_hdh;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ResumeService_hdh(ResumeRepository_hdh resumeRepository_hdh) {
        this.resumeRepository_hdh = resumeRepository_hdh;
    }

    public List<ResumeDTO_hdh> getAllResumes() {
        return resumeRepository_hdh.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ResumeDTO_hdh convertToDto(Resume_hdh resume) {
        return ResumeDTO_hdh.builder()
                .id(resume.getId())
                .fullName(resume.getFullName())
                .email(resume.getEmail())
                .phone(resume.getPhone())
                .summary(resume.getSummary())
                .experience(resume.getExperience())
                .education(resume.getEducation())
                .skills(resume.getSkills())
                .resumeFile(resume.getResumeFile())
                .resumeFilename(resume.getResumeFilename())
                .createDate(resume.getCreateDate())
                .createBy(resume.getCreateBy())
                .updateDate(resume.getUpdateDate())
                .updateBy(resume.getUpdateBy())
                .gender(resume.getGender())
                .company(resume.getCompany())
                .department(resume.getDepartment())
                .position(resume.getPosition())
                .jobTitle(resume.getJobTitle())
                .build();
    }
}
