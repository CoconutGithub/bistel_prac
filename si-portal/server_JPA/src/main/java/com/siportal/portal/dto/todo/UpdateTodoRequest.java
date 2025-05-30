package com.siportal.portal.dto.todo;

import java.time.LocalDateTime;

import lombok.Getter;

@Getter
public class UpdateTodoRequest {
  private long id;
  private String todoType;
  private String worker;
  private String title;
  private String content;
  private LocalDateTime dueDate;
  private String progressStatus;
}
