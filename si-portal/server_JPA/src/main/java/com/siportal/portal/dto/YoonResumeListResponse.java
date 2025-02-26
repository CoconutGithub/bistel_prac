package com.siportal.portal.dto;

import com.siportal.portal.controller.biz.YoonResumeController;

import lombok.Getter;

@Getter
public class YoonResumeListResponse {
    String fullName;
    String company;
    String position;
    String jobTitle;


    public YoonResumeListResponse(YoonResumeListProjection projection){
        fullName=projection.getFullName();
        company=projection.getCompany();
        position=projection.getPosition();
        jobTitle=projection.getJobTitle();
    }
}




