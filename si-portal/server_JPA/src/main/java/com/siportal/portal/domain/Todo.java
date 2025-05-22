package com.siportal.portal.domain;

import com.siportal.portal.dto.todo.UpdateTodoRequest;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Getter;

@Entity
@Getter
public class Todo {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name="todo_type")
  private String todoType;

  @Column
  private String worker;

  @Column
  private String title;

  @Column
  private String content;

  @Column(name="due_date")
  private LocalDateTime dueDate;

  @Column(name="progress_status")
  private String progressStatus;

  @Builder
  public Todo(String todoType, String worker, String title, String content, LocalDateTime dueDate, String progressStatus) {
    this.todoType = todoType;
    this.worker = worker;
    this.title = title;
    this.content = content;
    this.dueDate = dueDate;
    this.progressStatus = progressStatus;
  }

  public void update(UpdateTodoRequest updateTodoRequest){
    this.todoType = updateTodoRequest.getTodoType();
    this.worker = updateTodoRequest.getWorker();
    this.title = updateTodoRequest.getTitle();
    this.content = updateTodoRequest.getContent();
    this.dueDate = updateTodoRequest.getDueDate();
    this.progressStatus = updateTodoRequest.getProgressStatus();
  }

}
