package com.siportal.portal.repository;

import com.siportal.portal.domain.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

public interface CodeRepository extends JpaRepository<Code, Integer> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM P_CODE WHERE CODE_ID = :codeId or PARENT_ID = :codeId", nativeQuery = true)
    int deleteCode(Integer codeId);

    List<Code> findAll();
}
