package com.siportal.portal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileRequest {
    private String fileGroupId;
    private String fileName;
    private String filePath;
    private long fileSize;
    private String createdBy;
    private String updatedBy;
}
