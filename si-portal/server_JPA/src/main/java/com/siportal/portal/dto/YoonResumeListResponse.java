package com.siportal.portal.dto;

import com.siportal.portal.controller.biz.YoonResumeController;

import lombok.Getter;

@Getter
public class YoonResumeListResponse {
    private int gridRowId;
    private int id;
    private String fullName;
    private String company;
    private String position;
    private String jobTitle;


    public YoonResumeListResponse(YoonResumeListProjection projection){
        gridRowId= projection.getGridRowId();
        id=projection.getId();
        fullName=projection.getFullName();
        company=projection.getCompany();
        position=projection.getPosition();
        jobTitle=projection.getJobTitle();
    }
}




