package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Generated;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "p_expense", uniqueConstraints = {
        @UniqueConstraint(columnNames = "file_group_id")
})
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")
    private Long expenseId;

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

//    @Column(name = "category", nullable = false, )
}
