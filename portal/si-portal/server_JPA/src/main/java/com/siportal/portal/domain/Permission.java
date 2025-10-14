package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
            sequenceName = "SEQ_P_PERMISSION",
            allocationSize = 1
    )
    @Column(name = "PERMISSION_ID", nullable = false)
    private Integer permissionId;

    // Role과 ManyToOne 관계 설정
    @ManyToOne
    @JoinColumn(name = "ROLE_ID", nullable = false, insertable = false, updatable = false)
    private Role role;

    // Menu와 ManyToOne 관계 설정
    @ManyToOne
    @JoinColumn(name = "MENU_ID", nullable = false, insertable = false, updatable = false)
    private Menu menu;

    @Column(name = "ROLE_ID", nullable = false)
    private Integer roleId; // 기존 roleId 유지 (외래키로 사용)

    @Column(name = "MENU_ID", nullable = false)
    private Integer menuId; // 기존 menuId 유지 (외래키로 사용)

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
