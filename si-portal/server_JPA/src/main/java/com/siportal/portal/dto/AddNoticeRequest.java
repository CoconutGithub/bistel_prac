package com.siportal.portal.dto;


import com.siportal.portal.domain.Notice;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
public class AddNoticeRequest {
  private String title;
  private String content;
  private LocalDateTime noticeStart;   //시간은 형식 검사가 필요하겠지?
  private LocalDateTime noticeEnd;
  private Long fileId;

//  public Notice toEntity(){
//      return Notice.builder()
//                   .title(title)
//                   .content(content)
//                   .noticeStart(noticeStart)
//                   .noticeEnd(noticeEnd)
//                   .fileId(fileId)
//          .createdAt(LocalDateTime.now())
//
//  }//1. Notice에 builder 추가
  //2.
}
