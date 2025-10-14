package com.siportal.portal.repository;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.domain.Todo;

import com.siportal.portal.domain.User;
import com.siportal.portal.dto.todo.TodoResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Integer> {
    //모든 사용자를 다 조회해 온다.
    @Query(value = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY A.CREATE_DATE DESC) as GRID_ROW_ID,
                A.ID, 
                A.TODO_TYPE, 
                A.WORKER, 
                A.TITLE, 
                A.CONTENT,
                TO_CHAR(A.DUE_DATE, 'YYYY-MM-DD"T"HH24:MI:SS') AS DUE_DATE,
                A.PROGRESS_STATUS,
                TO_CHAR(A.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE,
                A.CREATE_BY,
                TO_CHAR(A.UPDATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS UPDATE_DATE,              
                A.UPDATE_BY
            FROM TODO A
            WHERE 1=1
            ORDER BY A.CREATE_DATE DESC
            """, nativeQuery = true)
    List<ComResultMap> getTodoAll();

}
