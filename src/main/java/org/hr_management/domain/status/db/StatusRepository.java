package org.hr_management.domain.status.db;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatusRepository extends JpaRepository<StatusEntity, Integer> {

    Optional<StatusEntity> findByStatusCode(String statusCode);
}
