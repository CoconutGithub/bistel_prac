package org.hr_management.domain.status;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "STATUS")
public class StatusEntity {

    @Id
    @Column(name = "STATUS_CODE", length = 20)
    private String statusCode;

    @Column(name = "STATUS_NAME", length = 20, nullable = false)
    private String statusName;

    @Column(name = "STATUS_DESCRIPTION", length = 100)
    private String statusDescription;

    @Column(name = "TYPE", length = 20)
    private String type;

}