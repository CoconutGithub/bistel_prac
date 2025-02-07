package com.siportal.portal.dto;

import java.time.LocalDateTime;

public interface MenuRoleDTO {
    Long getPermissionId();
    String getRoleName();
    String  getCanCreate();
    String  getCanRead();
    String  getCanUpdate();
    String  getCanDelete();
    LocalDateTime getCreateDate();
    String getCreateBy();
    LocalDateTime getUpdateDate();
    String getUpdateBy();
}
