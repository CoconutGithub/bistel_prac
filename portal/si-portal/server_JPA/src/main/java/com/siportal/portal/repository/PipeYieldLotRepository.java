package com.siportal.portal.repository;

import com.siportal.portal.domain.PipeYieldLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PipeYieldLotRepository extends JpaRepository<PipeYieldLot, String> {
    // 날짜 범위로 조회 (작업일자 기준 내림차순 정렬 추천)
    List<PipeYieldLot> findAllByWorkDateBetweenOrderByWorkDateDesc(String startDate, String endDate);

    // [NEW] 동적 쿼리: 날짜, 수율 범위 (Deprecated 예정이나 유지)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM PipeYieldLot p WHERE p.workDate BETWEEN :startDate AND :endDate " +
            "AND (:minYield IS NULL OR p.yieldRate >= :minYield) " +
            "AND (:maxYield IS NULL OR p.yieldRate <= :maxYield) " +
            "ORDER BY p.workDate DESC")
    List<PipeYieldLot> findByDynamicCondition(
            @org.springframework.web.bind.annotation.RequestParam("startDate") String startDate,
            @org.springframework.web.bind.annotation.RequestParam("endDate") String endDate,
            @org.springframework.web.bind.annotation.RequestParam("minYield") Double minYield,
            @org.springframework.web.bind.annotation.RequestParam("maxYield") Double maxYield
    );

    // [SPECIALIZED 2] 강관 저수율 조회 (기간 포함)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM PipeYieldLot p WHERE p.workDate BETWEEN :startDate AND :endDate AND p.yieldRate <= :maxYield ORDER BY p.yieldRate ASC")
    List<PipeYieldLot> findLowYield(
            @org.springframework.web.bind.annotation.RequestParam("startDate") String startDate,
            @org.springframework.web.bind.annotation.RequestParam("endDate") String endDate,
            @org.springframework.web.bind.annotation.RequestParam("maxYield") Double maxYield
    );

    // [SPECIALIZED 2-2] 강관 고수율 조회 (기간 포함)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM PipeYieldLot p WHERE p.workDate BETWEEN :startDate AND :endDate AND p.yieldRate >= :minYield ORDER BY p.yieldRate DESC")
    List<PipeYieldLot> findHighYield(
            @org.springframework.web.bind.annotation.RequestParam("startDate") String startDate,
            @org.springframework.web.bind.annotation.RequestParam("endDate") String endDate,
            @org.springframework.web.bind.annotation.RequestParam("minYield") Double minYield
    );

    // [SPECIALIZED 3] 강관 과잉 생산 조회
    @org.springframework.data.jpa.repository.Query("SELECT p FROM PipeYieldLot p WHERE p.excessYn = 'Y' ORDER BY p.workDate DESC")
    List<PipeYieldLot> findExcess();
}