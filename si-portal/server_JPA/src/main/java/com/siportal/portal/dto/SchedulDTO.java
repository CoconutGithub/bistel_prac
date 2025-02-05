package com.siportal.portal.dto;

import lombok.Data;

@Data
public class SchedulDTO {
    private int gridRowId;
    private String jobName;
    private String groupName;
    private String triggerKey;
    private String className;
    private String cronTab;
    private String status;
    private String createDate;
}
