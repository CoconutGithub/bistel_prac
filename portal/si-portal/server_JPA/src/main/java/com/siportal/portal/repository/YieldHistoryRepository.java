package com.siportal.portal.repository;

import com.siportal.portal.domain.YieldHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface YieldHistoryRepository extends JpaRepository<YieldHistory, String> {

    // 9가지 아이템 기준에 맞는 이력 데이터 조회 (날짜 오름차순)
    // COALESCE를 사용하여 NULL 값 비교 문제 방지 (데이터 상황에 따라 필요할 수 있음)
    @Query("SELECT y FROM YieldHistory y WHERE " +
            "y.itemType = :itemType AND " +
            "y.steelGradeL = :steelGradeL AND " +
            "y.steelGradeGroup = :steelGradeGroup AND " +
            "y.shape = :shape AND " +
            "y.inhouseSteelName = :inhouseSteelName AND " +
            "y.orderHeatTreat = :orderHeatTreat AND " +
            "y.materialL = :materialL AND " +
            "y.surface = :surface AND " +
            "y.orderOuterDia = :orderOuterDia " +
            "ORDER BY y.workDate ASC")
    List<YieldHistory> findHistoryByItemCriteria(
            @Param("itemType") String itemType,
            @Param("steelGradeL") String steelGradeL,
            @Param("steelGradeGroup") String steelGradeGroup,
            @Param("shape") String shape,
            @Param("inhouseSteelName") String inhouseSteelName,
            @Param("orderHeatTreat") String orderHeatTreat,
            @Param("materialL") String materialL,
            @Param("surface") String surface,
            @Param("orderOuterDia") BigDecimal orderOuterDia
    );
}
