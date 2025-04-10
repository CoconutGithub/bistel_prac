package com.siportal.portal.repository;

import com.siportal.portal.domain.Information;
import org.springframework.data.jpa.repository.JpaRepository;
public interface InformationRepository extends JpaRepository<Information, Integer> {
}
