package com.siportal.portal.repository;

import com.siportal.portal.domain.BarYieldLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarYieldLotRepository extends JpaRepository<BarYieldLot, String> {
    // 날짜 범위로 조회
    List<BarYieldLot> findAllByWorkDateBetweenOrderByWorkDateDesc(String startDate, String endDate);

    // [NEW] 동적 쿼리: 날짜, 수율 범위 (Deprecated 예정이나 유지)
    @org.springframework.data.jpa.repository.Query("SELECT b FROM BarYieldLot b WHERE b.workDate BETWEEN :startDate AND :endDate " +
            "AND (:minYield IS NULL OR b.yieldRate >= :minYield) " +
            "AND (:maxYield IS NULL OR b.yieldRate <= :maxYield) " +
            "ORDER BY b.workDate DESC")
    List<BarYieldLot> findByDynamicCondition(
            @org.springframework.web.bind.annotation.RequestParam("startDate") String startDate,
            @org.springframework.web.bind.annotation.RequestParam("endDate") String endDate,
            @org.springframework.web.bind.annotation.RequestParam("minYield") Double minYield,
            @org.springframework.web.bind.annotation.RequestParam("maxYield") Double maxYield
    );

    // [SPECIALIZED 1] 강봉 고수율 조회 (>=)
    @org.springframework.data.jpa.repository.Query("SELECT b FROM BarYieldLot b WHERE b.yieldRate >= :minYield ORDER BY b.yieldRate DESC")
    List<BarYieldLot> findHighYield(@org.springframework.web.bind.annotation.RequestParam("minYield") Double minYield);

    // [SPECIALIZED 1-2] 강봉 저수율 조회 (<=)
    @org.springframework.data.jpa.repository.Query("SELECT b FROM BarYieldLot b WHERE b.yieldRate <= :maxYield ORDER BY b.yieldRate ASC")
    List<BarYieldLot> findLowYield(@org.springframework.web.bind.annotation.RequestParam("maxYield") Double maxYield);

    // [SPECIALIZED 3] 강봉 과잉 생산 조회
    @org.springframework.data.jpa.repository.Query("SELECT b FROM BarYieldLot b WHERE b.excessYn = 'Y' ORDER BY b.workDate DESC")
    List<BarYieldLot> findExcess();
}