package com.siportal.portal.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PPermissionDTO {

    private Long permissionId;
    private Integer roleId;
    private Integer menuId;
    private String canCreate;
    private String canRead;
    private String canUpdate;
    private String canDelete;
    private LocalDateTime createDate;
    private String createBy;
    private LocalDateTime updateDate;
    private String updateBy;
}
