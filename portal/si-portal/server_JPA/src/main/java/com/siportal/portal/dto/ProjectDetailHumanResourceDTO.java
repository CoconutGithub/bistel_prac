package com.siportal.portal.dto;

import com.siportal.portal.domain.ProjectHumanResource;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ProjectDetailHumanResourceDTO {
    private Long resourceAllocationId;
    private String userId;
    private Long roleId;     // Role ID
    private String roleName;   // Role 이름 (Role 엔티티에 getName() 같은 메소드가 있다고 가정)
    private BigDecimal plannedMm;
    private BigDecimal actualMm;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;

    // Entity -> DTO 변환을 위한 정적 팩토리 메소드
    public static ProjectDetailHumanResourceDTO fromEntity(ProjectHumanResource entity) {
        if (entity == null) {
            return null;
        }
        ProjectDetailHumanResourceDTO dto = new ProjectDetailHumanResourceDTO();
        dto.setResourceAllocationId(entity.getResourceAllocationId());
        dto.setUserId(entity.getUserId());

        // Role이 null이 아닐 경우 ID와 이름 설정 (Lazy Loading 방지)
        if (entity.getRole() != null) {
            dto.setRoleId(Long.valueOf(entity.getRole().getRoleId()));
            // Role 엔티티에 getRoleName() 메소드가 있다고 가정합니다. 없다면 실제 필드명으로 수정하세요.
            dto.setRoleName(entity.getRole().getRoleName());
        }

        dto.setPlannedMm(entity.getPlannedMm());
        dto.setActualMm(entity.getActualMm());
        dto.setActualStartDate(entity.getActualStartDate());
        dto.setActualEndDate(entity.getActualEndDate());
        dto.setPlannedStartDate(entity.getPlannedStartDate());
        dto.setPlannedEndDate(entity.getPlannedEndDate());
        return dto;
    }
}
