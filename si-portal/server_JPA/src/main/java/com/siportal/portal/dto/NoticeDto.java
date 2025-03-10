package com.siportal.portal.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NoticeDto {
    private Long id;
    private String title;
    private String content;
    private String noticeStart;
    private String noticeEnd;
    private Long fileId;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}
