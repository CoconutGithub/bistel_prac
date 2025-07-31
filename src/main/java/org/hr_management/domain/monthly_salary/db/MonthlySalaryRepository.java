package org.hr_management.domain.monthly_salary.db;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface MonthlySalaryRepository extends JpaRepository<MonthlySalaryEntity, Long> {
    @Procedure(procedureName = "CREATE_MONTHLY_SALARY_TO_ALL_EMPLOYEE")
    void createMonthlySalaryToAllEmployee(@Param("p_pay_date") LocalDate payDate);
}
