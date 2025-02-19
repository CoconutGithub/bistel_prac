package com.siportal.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.FloraResumeDto;
import com.siportal.portal.repository.FloraResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
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

    public void createResume(FloraResumeDto resumeDto) {

        try {
            System.out.println("testtestsetsetsetsetsetest");
            Resume resume = convertToEntity(resumeDto);
            System.out.println("여기여긱여ㅣㄱ");
            floraResumeRepository.save(resume);
        } catch (Exception e) {
            System.err.println("오류 발생" + e.getMessage());
            e.printStackTrace();
        }
    }

    private FloraResumeDto convertToDto(Resume resume) {
        return FloraResumeDto.builder()
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

    private Resume convertToEntity(FloraResumeDto dto) {
        return Resume.builder()
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .summary(dto.getSummary())
                .experience((List<Map<String, Object>>) dto.getExperience())
                .education((List<Map<String, Object>>) dto.getEducation())
                .skills((List<Map<String, Object>>) dto.getSkills())
                .resumeFile(dto.getResumeFile().orElse(new byte[0]))
                .resumeFilename(dto.getResumeFilename() != null ? dto.getResumeFilename() : "")
                .createBy(dto.getCreateBy())
                .updateBy(dto.getUpdateBy())
                .gender(dto.getGender())
                .company(dto.getCompany())
                .department(dto.getDepartment())
                .position(dto.getPosition())
                .jobTitle(dto.getJobTitle())
                .build();
    }
}
