package com.prac.semiconductor.Repository;

import com.prac.semiconductor.Domain.Line;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LineRepository extends JpaRepository<Line, Integer> {
    /**
     * 모든 Line과 관련된 Process, Equipment, SetValue, Parameter를
     * 한 번의 쿼리로 모두 조회합니다 (N+1 문제 해결).
     * `DISTINCT`를 사용하여 Line이 중복 조회되는 것을 방지합니다.
     */
    @Query("SELECT DISTINCT l FROM Line l " +
            "LEFT JOIN FETCH l.processes p " +
            "LEFT JOIN FETCH p.equipments e " +
            "LEFT JOIN FETCH e.setValues sv " +
            "LEFT JOIN FETCH sv.parameter")
    List<Line> findAllWithDetails();
}
