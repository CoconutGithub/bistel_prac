package org.hr_management.domain.filter.db;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hr_management.domain.employee.db.EmployeeEntity;

@Entity
@Getter
@Setter
@IdClass(FilterId.class)
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "USER_FILTER")
public class UserFilterEntity {
    @Id
    @JoinColumn(name = "EMP_ID", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private EmployeeEntity employee;
    @Id
    @Column(name = "TABLE_NAME",nullable = false,length = 50)
    private String tableName;
    @Id
    @Column(name = "FILTER_NAME",nullable = false, length = 100)
    private String filterName;
    @Id
    @Column(name = "FILTER_TYPE",nullable = false, length = 30)
    private String filterType;

    @Column(name = "FILTER_VALUE")
    private String filterValue;

    @Column(name = "VALUE_TYPE")
    private String valueType;
}
