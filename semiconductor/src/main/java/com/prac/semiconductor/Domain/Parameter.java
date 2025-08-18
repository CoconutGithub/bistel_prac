package com.prac.semiconductor.Domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "PARAMETER", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_PARAMETER_CODE", columnNames = {"PARAMETER_CODE"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Parameter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PARAMETER_ID")
    private Integer parameterId;

    @Column(name = "PARAMETER_CODE", nullable = false, length = 50)
    private String parameterCode;

    @Column(name = "PARAMETER_NAME", nullable = false, length = 200)
    private String parameterName;

    @Column(name = "UNIT", length = 30)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "VALUE_TYPE", nullable = false, length = 20)
    private ValueType valueType;

    @Column(name = "DECIMALS")
    private Integer decimals;

    // 양방향 관계 설정
    @Builder.Default
    @OneToMany(mappedBy = "parameter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SetValue> setValues = new ArrayList<>();
}
