package com.siportal.portal.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class YoonUpdateNoticeRequest {
   Long id;
   String title;
   String Content;
   LocalDateTime noticeStart;   //시간은 형식 검사가 필요하겠지?
   LocalDateTime noticeEnd;
   Long FileId;

}
