package org.hr_management.domain.department.service;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.department.db.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<String> getDepartmentNames() {
        return departmentRepository.findDepartmentNames();
    }
}
