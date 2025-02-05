package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
@Table(name = "P_ROLE")
@Getter
@Setter
@NoArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "role_seq_generator")
    @SequenceGenerator(
            name = "role_seq_generator",
            sequenceName = "seq_p_role",
            allocationSize = 1
    )
    @Column(name = "ROLE_ID", nullable = false)
    private Integer roleId;

    @Column(name = "ROLE_NAME", length = 100, nullable = false)
    private String roleName;

    @Column(name = "STATUS", length = 20)
    private String status = "INACTIVE";

    @Column(name = "IS_MIGHTY", length = 1)
    private String isMighty = "N";

    @Column(name = "CREATE_DATE", updatable = false)
    private LocalDateTime createDate;

    @Column(name = "CREATE_BY", length = 100, updatable = false)
    private String createBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "UPDATE_BY", length = 100)
    private String updateBy;
}

