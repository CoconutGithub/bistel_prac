package com.siportal.portal.service;

import com.siportal.portal.domain.Todo;
import com.siportal.portal.dto.todo.AddTodoRequest;
import com.siportal.portal.dto.todo.TodoResponse;
import com.siportal.portal.dto.todo.UpdateTodoRequest;
import com.siportal.portal.repository.TodoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class TodoService {

  private final TodoRepository todoRepository;

  //create
  public TodoResponse save(AddTodoRequest addTodoRequest){
      return new TodoResponse(todoRepository.save(addTodoRequest.toEntity()));
  }

  //read
  public List<TodoResponse> findAll(){
    return todoRepository.findAll().stream().map(TodoResponse::new).toList();
  }

  public TodoResponse findById(long id){
    return new TodoResponse(todoRepository.findById(id)
                                          .orElseThrow(() ->new IllegalArgumentException("not found"+ id)));
  }

  //update
  @Transactional
  public int update(List<UpdateTodoRequest> updateTodoRequests){
    int count=0;
    for(UpdateTodoRequest request: updateTodoRequests){
      Todo todo = todoRepository.findById(request.getId()).orElseThrow(()->new IllegalArgumentException());
      count++;
      todo.update(request);
    }
    return count;
  }

  //delete
  public void delete(List<Long> ids){
    todoRepository.deleteAllById(ids);
  }
}
