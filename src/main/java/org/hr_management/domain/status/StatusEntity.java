package org.hr_management.domain.status;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "status")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatusEntity {

    @Id
    @Column(length = 20)
    private String statusCode;

    @Column(length = 20, nullable = false)
    private String statusName;

    @Column(length = 100)
    private String statusDescription;

    @Column(length = 20)
    private String type;
}
