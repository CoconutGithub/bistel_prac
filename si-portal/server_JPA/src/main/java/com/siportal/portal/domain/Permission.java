package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
@Table(name = "P_PERMISSION")
@Getter
@Setter
@NoArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "permission_seq_generator")
    @SequenceGenerator(
            name = "permission_seq_generator",
            sequenceName = "SEQ_P_PERMISSION",  // 시퀀스 이름 수정
            allocationSize = 1
    )
    @Column(name = "PERMISSION_ID", nullable = false)
    private Integer permissionId;

    @Column(name = "ROLE_ID", nullable = false)
    private Integer roleId;

    @Column(name = "MENU_ID", nullable = false)
    private Integer menuId;

    @Column(name = "CAN_CREATE", length = 1)
    private String canCreate = "N";

    @Column(name = "CAN_READ", length = 1)
    private String canRead = "N";

    @Column(name = "CAN_UPDATE", length = 1)
    private String canUpdate = "N";

    @Column(name = "CAN_DELETE", length = 1)
    private String canDelete = "N";

    @Column(name = "CREATE_DATE", updatable = false)
    private LocalDateTime createDate;

    @Column(name = "CREATE_BY", length = 100, updatable = false)
    private String createBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "UPDATE_BY", length = 100)
    private String updateBy;
}
