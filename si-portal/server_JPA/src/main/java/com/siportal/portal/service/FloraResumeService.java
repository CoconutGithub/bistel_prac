package com.siportal.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.FloraResumeDto;
import com.siportal.portal.repository.FloraResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FloraResumeService {

    private final FloraResumeRepository floraResumeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FloraResumeService(FloraResumeRepository floraResumeRepository) {
        this.floraResumeRepository = floraResumeRepository;
    }

    public List<FloraResumeDto> getAllResumes() {
        return floraResumeRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private FloraResumeDto convertToDto(Resume resume) {
        return FloraResumeDto.builder()
                .id(resume.getId())
                .fullName(resume.getFullName())
                .email(resume.getEmail())
                .phone(resume.getPhone())
                .summary(resume.getSummary())
                .experience(Resume.toJson(resume.getExperience()))
                .education(Resume.toJson(resume.getEducation()))
                .skills(Resume.toJson(resume.getSkills()))
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
