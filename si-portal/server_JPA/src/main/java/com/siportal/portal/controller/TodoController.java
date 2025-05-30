package com.siportal.portal.controller;

import com.siportal.portal.domain.Todo;
import com.siportal.portal.dto.todo.AddTodoRequest;
import com.siportal.portal.dto.todo.TodoResponse;
import com.siportal.portal.dto.todo.UpdateTodoRequest;
import com.siportal.portal.service.TodoService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/todo")
@RequiredArgsConstructor
public class TodoController {

  private final TodoService todoService;

  @PostMapping
  public ResponseEntity<TodoResponse> addTodo(@RequestBody AddTodoRequest addTodoRequest){
    TodoResponse response = todoService.save(addTodoRequest);
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
  @GetMapping
  public ResponseEntity<List<TodoResponse>> findAllTodos(){
    List<TodoResponse> response= todoService.findAll();
    return ResponseEntity.ok().body(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<TodoResponse> getTodo(@PathVariable Long id){
    TodoResponse response = todoService.findById(id);
    return ResponseEntity.ok().body(response);
  }

  @PutMapping
  public ResponseEntity<Integer> updateTodo(@RequestBody List<UpdateTodoRequest> updateTodoRequests){
     int count = todoService.update(updateTodoRequests);
    return ResponseEntity.ok().body(count);
  }

  @DeleteMapping
  public ResponseEntity<Void> removeTodo(@RequestBody List<Long> ids){
    todoService.delete(ids);
    return ResponseEntity.ok().build();
  }
}
