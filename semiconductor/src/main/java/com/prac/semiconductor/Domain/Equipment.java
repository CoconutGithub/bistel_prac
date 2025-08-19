package com.prac.semiconductor.Domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "EQUIPMENT", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_EQUIP_NAME", columnNames = {"EQUIPMENT_NAME"}),
        @UniqueConstraint(name = "UQ_PROC_SERIAL", columnNames = {"PROCESS_ID", "SERIAL_NO"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "EQUIPMENT_ID")
    private Integer equipmentID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROCESS_ID", nullable = false)
    private Process process;

    @Column(name = "EQUIPMENT_MODEL", nullable = false, length = 30)
    private String equipmentModel;

    @Lob
    @Column(name = "EQUIPMENT_DESCRIPTION")
    private String equipmentDescription;

    @Column(name = "SERIAL_NO", nullable = false)
    private int serialNo;

    @Column(name = "EQUIPMENT_NAME", nullable = false, length = 300)
    private String equipmentName;

    @Enumerated(EnumType.STRING) // Enum의 이름을 DB에 문자열로 저장
    @Column(name = "STATUS", nullable = false, length = 30)
    private EquipmentStatus status;

    // 양방향 관계 설정
    @Builder.Default
    @OneToMany(mappedBy = "equipment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SetValue> setValues = new HashSet<>();
}
