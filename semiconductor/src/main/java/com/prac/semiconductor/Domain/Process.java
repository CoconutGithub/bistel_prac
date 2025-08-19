package com.prac.semiconductor.Domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "PROCESS", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_LINE_PROC_NAME", columnNames = {"LINE_ID", "PROCESS_NAME"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Process {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PROCESS_ID")
    private Integer processID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LINE_ID", nullable = false)
    private Line line;

    @Column(name = "PROCESS_NAME", nullable = false, length = 100)
    private String processName;

    @Column(name = "PROCESS_NO", length = 10)
    private String processNo;

    @Lob
    @Column(name = "PROCESS_DESCRIPTION")
    private String processDescription;

    @Column(name = "NEXT_SERIAL", nullable = false)
    private int nextSerial = 1;

    // 양방향 관계 설정 (Process 하나에 여러 Equipment)
    @Builder.Default
    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Equipment> equipments = new HashSet<>();
}
