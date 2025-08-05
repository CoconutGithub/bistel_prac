package org.hr_management.domain.monthly_salary.db;

import org.hr_management.domain.monthly_salary.dto.SalaryListDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MonthlySalaryRepository extends JpaRepository<MonthlySalaryEntity, Long> {
    @Procedure(procedureName = "CREATE_MONTHLY_SALARY_TO_ALL_EMPLOYEE")
    void createMonthlySalaryToAllEmployee(@Param("p_pay_date") LocalDate payDate);

    @Query("""
    SELECT new org.hr_management.domain.monthly_salary.dto.SalaryListDto(
        m.monthlySalaryId,
        e.empId,
        CONCAT(e.firstName, ' ', e.lastName),
        m.payDate,
        m.baseSalary,
        m.mealAllow,
        m.transportAllow,
        m.comm,
        m.paymentOthers,
        m.nationalPension,
        m.healthInsurance,
        m.employmentInsurance,
        m.longtermCareInsurance,
        m.incomeTax,
        m.localIncomeTax,
        m.deductionOthers
    )
    FROM MonthlySalaryEntity m
    JOIN m.empId e
    """)
    List<SalaryListDto> findAllSalaryWithEmpInfo();


    @Modifying
    @Query(value = """
            DELETE FROM monthly_salary WHERE emp_id NOT IN (SELECT emp_id FROM employee)
            """, nativeQuery = true)
    void deleteAllMonthlySalaryNotinEmp();
}
