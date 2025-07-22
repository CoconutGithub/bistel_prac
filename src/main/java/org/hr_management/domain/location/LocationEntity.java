package org.hr_management.domain.location;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "location")
@SequenceGenerator(
        name = "location_seq_generator",
        sequenceName = "location_id_seq",
        allocationSize = 1
)
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "location_seq_generator")
    private Integer locationId;

    @Column(length = 100 , nullable = true)
    private String locationName;

    @Column(length = 150 , nullable = true)
    private String address;
}
