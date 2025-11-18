package com.siportal.portal.repository;

import com.siportal.portal.domain.PipeYieldLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PipeYieldLotRepository extends JpaRepository<PipeYieldLot, String> {
    // 필요시 추가 검색 메소드 정의
}