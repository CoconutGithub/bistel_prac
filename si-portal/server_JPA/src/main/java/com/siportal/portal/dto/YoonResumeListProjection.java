package com.siportal.portal.dto;

public interface YoonResumeListProjection {
  //이름, 회사, 포지션, 직무
  int getGridRowId();
  int getId();
  String getFullName();
  String getCompany();
  String getPosition();
  String getJobTitle();
}
