package com.siportal.portal.service;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.domain.Todo;
import com.siportal.portal.domain.User;
import com.siportal.portal.dto.todo.AddTodoRequest;
import com.siportal.portal.dto.todo.TodoResponse;
import com.siportal.portal.dto.todo.UpdateTodoRequest;
import com.siportal.portal.repository.TodoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.RequestBody;


@Service
@RequiredArgsConstructor
public class TodoService {

  private final TodoRepository todoRepository;

  //create
  public TodoResponse save(AddTodoRequest addTodoRequest){
      return new TodoResponse(todoRepository.save(addTodoRequest.toEntity()));
  }

  //read
  public ResponseEntity<?> findAll(){
    List<ComResultMap> result = null;
    result = todoRepository.getTodoAll();
    return ResponseEntity.ok(result);   //todoRepository.findAll().stream().map(TodoResponse::new).toList();
  }

  public TodoResponse findById(Integer id){
    return new TodoResponse(todoRepository.findById(id)
                                          .orElseThrow(() ->new IllegalArgumentException("not found"+ id)));
  }

  //update
  @Transactional
  public ResponseEntity<?> update(@RequestBody Map<String, Object> requestData){
    try {
      // 데이터 파싱
      List<Map<String, Object>> updateList = (List<Map<String, Object>>) requestData.get("updateList");
      List<Map<String, Object>> deleteList = (List<Map<String, Object>>) requestData.get("deleteList");
      List<Map<String, Object>> createList = (List<Map<String, Object>>) requestData.get("createList");

      int updatedCount = 0;
      int deletedCount = 0;
      int createdCount = 0;

      // Update 처리
      for (Map<String, Object> todo : updateList) {
        Integer id = Integer.valueOf(todo.get("id").toString());
        Todo todoObj = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        todoObj.setTodoType((String)todo.get("todoType"));
        todoObj.setWorker((String)todo.get("worker"));
        todoObj.setTitle((String)todo.get("title"));
        todoObj.setContent((String)todo.get("content"));
        todoObj.setDueDate(LocalDateTime.parse((String)todo.get("dueDate")));
        todoObj.setProgressStatus((String)todo.get("progressStatus"));
        todoObj.setUpdateBy((String) todo.get("userName"));
        todoObj.setUpdateDate(LocalDateTime.now());

        updatedCount++;
      }

      // Delete 처리
      for (Map<String, Object> todo : deleteList) {
        Integer id = Integer.valueOf(todo.get("id").toString());
        todoRepository.deleteById(id);

        deletedCount++;
      }

      for (Map<String, Object> todo : createList) {
        Todo newTodo = new Todo();
        newTodo.setTodoType((String) todo.get("todoType"));
        newTodo.setWorker((String) todo.get("worker"));
        newTodo.setTitle((String) todo.get("title"));
        newTodo.setContent((String) todo.get("content"));
        newTodo.setDueDate(LocalDateTime.parse((String)todo.get("dueDate")));
        newTodo.setProgressStatus((String) todo.get("progressStatus"));
        newTodo.setCreateBy((String) todo.get("userName"));
        newTodo.setCreateDate(LocalDateTime.now());

        todoRepository.save(newTodo);
        createdCount++;
      }

      Map<String, Object> response = new HashMap<>();
      response.put("messageCode", "success");
      response.put("message", "모든 작업이 성공적으로 처리되었습니다.");
      response.put("updatedTodoCnt", updatedCount);
      response.put("deletedTodoCnt", deletedCount);
      response.put("createdTodoCnt", createdCount);



      return ResponseEntity.ok(response);
    } catch (Exception e) {
      e.printStackTrace();
      TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();

      return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED)
              .body("Error occurred: " + e.getMessage());
    }
  }

  //delete
  public void delete(List<Integer> ids){
    todoRepository.deleteAllById(ids);
  }
}
