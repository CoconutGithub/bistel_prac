package com.prac.semiconductor.Domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LINE", uniqueConstraints = {
        @UniqueConstraint(name = "UQ_LINE_NAME", columnNames = {"LINE_NAME"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Line {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LINE_ID")
    private Integer lineID;

    @Column(name = "LINE_NAME", nullable = false, length = 100)
    private String lineName;

    @Column(name = "LINE_LOCATION", nullable = false, length = 200)
    private String lineLocation;

    @Column(name = "LINE_UNIT",length = 10)
    private String lineUnit;

    @Lob
    @Column(name = "LINE_DESCRIPTION")
    private String lineDescription;

    @Builder.Default
    @OneToMany(mappedBy = "line", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Process> processes = new ArrayList<>();

}
