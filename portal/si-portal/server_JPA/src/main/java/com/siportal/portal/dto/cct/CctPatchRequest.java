package com.siportal.portal.dto.cct;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CctPatchRequest {

    private Integer cctId;

    private String accountName;

    private String projectName;

    private String projectCode;

    private String description;
}
