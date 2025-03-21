package com.siportal.portal.dto;


import java.time.LocalDateTime;

public interface YoonNoticeProjection {
  Long getGridRowId();
  Long getId();
  String getTitle();
  String getContent();
  String getNoticeStart();
  String getNoticeEnd();
  Long getFileId();
  String getCreatedAt();
  String getUpdatedAt();
}
