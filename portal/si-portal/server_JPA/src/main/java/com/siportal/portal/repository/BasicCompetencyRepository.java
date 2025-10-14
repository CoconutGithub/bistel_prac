package com.siportal.portal.repository;

import com.siportal.portal.domain.BasicCompetency;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BasicCompetencyRepository extends JpaRepository<BasicCompetency,Integer> {

    @Override
    List<BasicCompetency> findAll();
}
