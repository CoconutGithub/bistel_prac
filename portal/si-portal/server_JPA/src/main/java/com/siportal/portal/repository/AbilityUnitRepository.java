package com.siportal.portal.repository;

import com.siportal.portal.domain.AbilityUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AbilityUnitRepository extends JpaRepository<AbilityUnit,Integer> {

    @Override
    List<AbilityUnit> findAll();
}
