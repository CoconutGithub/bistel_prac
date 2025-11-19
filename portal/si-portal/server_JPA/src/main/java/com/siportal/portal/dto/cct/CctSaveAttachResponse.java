package com.siportal.portal.dto.cct;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CctSaveAttachResponse {
    private String fileName;
    private String filePath;
    private String bucket;
    private String downloadUrl;
}
