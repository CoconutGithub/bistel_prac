package org.hr_management.domain.status.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface StatusRepository extends JpaRepository<StatusEntity, String> {

    Optional<StatusEntity> findByStatusCode(String statusCode);

    Optional<StatusEntity> findByStatusName(String statusName);

    @Query("""
                SELECT s.statusCode
                FROM StatusEntity s
                WHERE s.type=:type
            """)
    List<String> findAllByType(String type);
}
