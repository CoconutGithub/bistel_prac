package com.siportal.portal.repository;

import com.siportal.portal.domain.PipeYieldLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipeYieldLotRepository extends JpaRepository<PipeYieldLot, String> {
    // 날짜 범위로 조회 (작업일자 기준 내림차순 정렬 추천)
    List<PipeYieldLot> findAllByWorkDateBetweenOrderByWorkDateDesc(String startDate, String endDate);
}