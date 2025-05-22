package com.siportal.portal.service;

import com.siportal.portal.domain.Todo;
import com.siportal.portal.dto.todo.AddTodoRequest;
import com.siportal.portal.dto.todo.TodoResponse;
import com.siportal.portal.dto.todo.UpdateTodoRequest;
import com.siportal.portal.repository.TodoRepository;
import org.springframework.stereotype.Service;
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
    return new TodoResponse(todoRepository.findById(id) //이러면 optional을 반환하나? 아님 orElseThrow가 optional에서 TodoResponse를 꺼내주나~?
                                          .orElseThrow(() ->new IllegalArgumentException("not found"+ id)));
  }

  //update
  public TodoResponse update(long id, UpdateTodoRequest updateTodoRequest){
    Todo todo = todoRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("not found"+ id)); // 오류가 생기면 프론트는 어떻게 동작할까?
    todo.update(updateTodoRequest);
    return new TodoResponse(todo); // 이 코드가 중복 되니까 메서드로 만들 수 있겠다.
  }

  //delete
  public void delete(long id){
    todoRepository.deleteById(id);
  }
}
