package com.siportal.portal.repository;

import com.siportal.portal.domain.BarYieldLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarYieldLotRepository extends JpaRepository<BarYieldLot, String> {
    // 날짜 범위로 조회
    List<BarYieldLot> findAllByWorkDateBetweenOrderByWorkDateDesc(String startDate, String endDate);
}