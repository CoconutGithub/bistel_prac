package com.siportal.portal.dto.todo;


import com.siportal.portal.domain.Todo;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
public class TodoResponse {
  private final String todoType;
  private final String worker;
  private final String title;
  private final String content;
  private final LocalDateTime dueDate;
  private final String progressStatus;

  public TodoResponse(Todo todo) {
    this.todoType = todo.getTodoType();
    this.worker = todo.getWorker();
    this.title = todo.getTitle();
    this.content = todo.getContent();
    this.dueDate = todo.getDueDate();
    this.progressStatus = todo.getProgressStatus();
  }
}
