package com.siportal.portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.siportal.portal.domain.Resume;
import com.siportal.portal.dto.FloraResumeDto;
import com.siportal.portal.dto.FloraResumeProjection;
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

    public List<FloraResumeProjection> getAllResumes() {
        
        return floraResumeRepository.findAllProjectedBy();
    }

    public void createResume(FloraResumeDto resumeDto) {
        try {
            Resume resume = convertToEntity(resumeDto);
            floraResumeRepository.save(resume);
        } catch (Exception e) {
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
                .experience(parseJson(resume.getExperience(), new TypeReference<List<Map<String, Object>>>() {}))
                .education(parseJson(resume.getEducation(), new TypeReference<List<Map<String, Object>>>() {}))
                .skills(parseJson(resume.getSkills(), new TypeReference<List<Map<String, Object>>>() {}))
                .resumeFile(Optional.ofNullable(resume.getResumeFile()))
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
                .experience(dto.getExperience())
                .education(dto.getEducation())
                .skills(dto.getSkills())
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

    private <T> T parseJson(String json, TypeReference<T> typeReference) {
        try {
            return objectMapper.readValue(json, typeReference);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
