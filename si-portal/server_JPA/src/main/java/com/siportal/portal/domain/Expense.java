package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "p_expense")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")
    private Long expenseId;

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "item", nullable = false, length = 255)
    private String item;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "file_group_id", nullable = true, length = 50)
    private Long fileGroupId;

    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP DEFAULT now()")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT now()")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    public static String generateFileGroupId() {
        return UUID.randomUUID().toString() + "-" + Instant.now().toEpochMilli();
    }
}
