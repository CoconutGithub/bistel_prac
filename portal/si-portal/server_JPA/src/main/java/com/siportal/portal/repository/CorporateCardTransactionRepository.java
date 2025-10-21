package com.siportal.portal.repository;

import com.siportal.portal.domain.CorporateCardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface CorporateCardTransactionRepository extends JpaRepository<CorporateCardTransaction, Integer> {

    // 날짜 필터 조건에 해당하는 결제 내역 조회
    @Query("SELECT cct " +
            "FROM CorporateCardTransaction cct " +
            "WHERE cct.approvalDate BETWEEN :startDate AND :endDate " +
            "ORDER BY cct.status desc ")
    List<CorporateCardTransaction> findByApprovalDateBetweenStartDateAndEndDate(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    // 결제 내역 업데이트

    // 첨부 파일 저장
}
