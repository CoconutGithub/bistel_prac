package com.siportal.portal.dto.cct;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CctPatchAttachRequest {
    private Integer cctId;
    private String currentFileName;
    private String updateFileName;
}
