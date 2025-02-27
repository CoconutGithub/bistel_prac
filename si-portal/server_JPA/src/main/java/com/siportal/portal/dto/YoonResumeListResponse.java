package com.siportal.portal.dto;

import com.siportal.portal.controller.biz.YoonResumeController;

import lombok.Getter;

@Getter
public class YoonResumeListResponse {
    int id;
    String fullName;
    String company;
    String position;
    String jobTitle;


    public YoonResumeListResponse(YoonResumeListProjection projection){
        id=projection.getId();
        fullName=projection.getFullName();
        company=projection.getCompany();
        position=projection.getPosition();
        jobTitle=projection.getJobTitle();
    }
}




