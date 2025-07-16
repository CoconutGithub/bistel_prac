package com.siportal.portal.dto.todo;
import com.siportal.portal.domain.Todo;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class AddTodoRequest {
  private String todoType;
  private String worker;
  private String title;
  private String content;
  private LocalDateTime dueDate;
  private String progressStatus;
  private LocalDateTime createDate;
  private String createBy;


  public Todo toEntity(){
    return Todo.builder()
               .content(todoType)
               .worker(worker)
               .title(title)
               .content(content)
               .dueDate(dueDate)
               .progressStatus(progressStatus)
               .createDate(LocalDateTime.now())
               .createBy(createBy)
               .build();
  }

}
