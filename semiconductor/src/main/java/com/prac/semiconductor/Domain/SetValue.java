package com.prac.semiconductor.Domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "SETVALUE", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_SETVAL", columnNames = {"EQUIPMENT_ID", "PARAMETER_ID"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SET_ID")
    private Integer setId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EQUIPMENT_ID", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARAMETER_ID", nullable = false)
    private Parameter parameter;

    // Oracle의 NUMBER 타입은 정밀도를 위해 BigDecimal로 매핑하는 것이 안전합니다.
    @Column(name = "SET_VALUE_NUM")
    private BigDecimal setValueNum;

    @Column(name = "SET_VALUE_TEXT", length = 4000)
    private String setValueText;

    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "UPDATED_BY", length = 100)
    private String updatedBy;

    // JPA 생명주기 콜백을 이용해 생성/수정 시간을 자동으로 관리할 수 있습니다.
    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.updatedAt = LocalDateTime.now();
    }
}