package com.siportal.portal.repository;

import com.siportal.portal.domain.BarYieldLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarYieldLotRepository extends JpaRepository<BarYieldLot, String> {
}