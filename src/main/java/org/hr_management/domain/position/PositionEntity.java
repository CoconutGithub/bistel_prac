package org.hr_management.domain.position;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "position")
@SequenceGenerator(
        name = "position_seq_generator",
        sequenceName = "position_id_seq",
        allocationSize = 1
)
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PositionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "position_seq_generator")
    private Integer positionId;

    @Column(length = 100, nullable = false)
    private String positionTitle;

    private Integer baseSalary;
}
