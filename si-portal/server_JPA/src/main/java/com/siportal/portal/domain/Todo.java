package com.siportal.portal.domain;

import com.siportal.portal.dto.todo.UpdateTodoRequest;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Todo {
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_todo")
  @SequenceGenerator(
          name = "seq_todo",
          sequenceName = "seq_todo",
          allocationSize = 1
  )

  private Integer id;

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

  @Column(name = "create_date")
  private LocalDateTime createDate;

  @Column(name = "create_by")
  private String createBy;

  @Column(name = "update_date")
  private LocalDateTime updateDate;

  @Column(name = "update_by")
  private String updateBy;

  @Builder
  public Todo(String todoType, String worker, String title, String content, LocalDateTime dueDate, String progressStatus, LocalDateTime createDate,  String createBy) {
    this.todoType = todoType;
    this.worker = worker;
    this.title = title;
    this.content = content;
    this.dueDate = dueDate;
    this.progressStatus = progressStatus;
    this.createDate = createDate;
    this.createBy = createBy;
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
