package org.hr_management.domain.monthly_salary.service;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.employee.db.EmployeeRepository;
import org.hr_management.domain.monthly_salary.db.MonthlySalaryEntity;
import org.hr_management.domain.monthly_salary.db.MonthlySalaryRepository;
import org.hr_management.domain.monthly_salary.dto.PaymentDto;
import org.hr_management.domain.monthly_salary.dto.SalaryListDto;
import org.hr_management.domain.monthly_salary.dto.SalaryUpdateDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MonthlySalaryService {

    private final MonthlySalaryRepository monthlySalaryRepository;
    private final EmployeeRepository employeeRepository;

    public void defaultPayment() {

    }
    public void customPayment(PaymentDto paymentDto,Integer empId) {

        MonthlySalaryEntity m_sal = new MonthlySalaryEntity();

        if(employeeRepository.findById(empId).isPresent()) {
            m_sal.setEmpId(employeeRepository.findById(empId).get());

            m_sal.setPayDate(paymentDto.getPayDate());
            m_sal.setBaseSalary(Long.valueOf(paymentDto.getBaseSalary()));
            m_sal.setMealAllow(Long.valueOf(paymentDto.getMealAllow()));
            m_sal.setTransportAllow(Long.valueOf(paymentDto.getTransportAllow()));
            m_sal.setComm(Long.valueOf(paymentDto.getComm()));
            m_sal.setPaymentOthers(Long.valueOf(paymentDto.getPaymentOthers()));
            m_sal.setNationalPension(Long.valueOf(paymentDto.getNationalPension()));
            m_sal.setHealthInsurance(Long.valueOf(paymentDto.getHealthInsurance()));
            m_sal.setEmploymentInsurance(Long.valueOf(paymentDto.getEmploymentInsurance()));
            m_sal.setLongtermCareInsurance(Long.valueOf(paymentDto.getLongtermCareInsurance()));
            m_sal.setIncomeTax(Long.valueOf(paymentDto.getIncomeTax()));
            m_sal.setLocalIncomeTax(Long.valueOf(paymentDto.getLocalIncomeTax()));
            m_sal.setDeductionOthers(Long.valueOf(paymentDto.getDeductionOthers()));

            monthlySalaryRepository.save(m_sal);
        }
    }

    @Transactional
    public void cleanMonthlySalary() {
        monthlySalaryRepository.deleteAllMonthlySalaryNotinEmp();
    }

    public List<SalaryListDto> getAll() {
        return monthlySalaryRepository.findAllSalaryWithEmpInfo();
    }
    public void deleteBySalaryId(Long salaryId) {
        monthlySalaryRepository.deleteById(salaryId);
    }

    @Transactional
    public void updateSalary(Long salaryId, SalaryUpdateDto dto) {
        MonthlySalaryEntity m_sal = monthlySalaryRepository.findById(salaryId).orElseThrow(() -> new IllegalArgumentException("Invalid salaryId: " + salaryId));

        m_sal.setBaseSalary(dto.getBaseSalary());
        m_sal.setMealAllow(dto.getMealAllow());
        m_sal.setTransportAllow(dto.getTransportAllow());
        m_sal.setComm(dto.getComm());
        m_sal.setPaymentOthers(dto.getPaymentOthers());
        m_sal.setNationalPension(dto.getNationalPension());
        m_sal.setHealthInsurance(dto.getHealthInsurance());
        m_sal.setEmploymentInsurance(dto.getEmploymentInsurance());
        m_sal.setLongtermCareInsurance(dto.getLongtermCareInsurance());
        m_sal.setIncomeTax(dto.getIncomeTax());
        m_sal.setLocalIncomeTax(dto.getLocalIncomeTax());
        m_sal.setDeductionOthers(dto.getDeductionOthers());
        m_sal.setPayDate(dto.getPayDate());
    }
}
