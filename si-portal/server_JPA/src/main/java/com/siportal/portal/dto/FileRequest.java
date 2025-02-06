package com.siportal.portal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileRequest {
    private String gridRowId;
    private String fileName;
    private String filePath;
    private long fileSize;
}
