package org.hr_management.domain.monthly_salary.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonthlySalaryRepository extends JpaRepository<MonthlySalaryEntity,Long> {
}
