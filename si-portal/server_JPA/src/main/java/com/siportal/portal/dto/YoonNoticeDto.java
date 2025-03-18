package com.siportal.portal.dto;

import com.siportal.portal.domain.Notice;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
//@AllArgsConstructor
public class YoonNoticeDto {
  private Long gridRowId;
  private Long id;
  private String title;
  private String content;
  private String noticeStart;
  private String noticeEnd;
  private Long fileId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public YoonNoticeDto(){

  }


  public YoonNoticeDto(YoonNoticeProjection yoonNoticeProjection){
    gridRowId=yoonNoticeProjection.getGridRowId();
    id=yoonNoticeProjection.getId();
    title=yoonNoticeProjection.getTitle();
    content=yoonNoticeProjection.getContent();
    noticeStart=yoonNoticeProjection.getNoticeStart().toString();//dto와 엔티티의 자료형이 달라서 일단 이렇게 했다.
    noticeEnd=yoonNoticeProjection.getNoticeEnd().toString();
    fileId=yoonNoticeProjection.getFileId();
    createdAt=yoonNoticeProjection.getCreatedAt();
    updatedAt=yoonNoticeProjection.getUpdatedAt();
  }
}
