package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
@Table(name = "P_MENU")
@Getter
@Setter
@NoArgsConstructor
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "menu_seq_generator")
    @SequenceGenerator(
            name = "menu_seq_generator",
            sequenceName = "SEQ_P_MENU",  // 시퀀스 이름 수정
            allocationSize = 1
    )
    @Column(name = "MENU_ID", nullable = false)
    private Integer menuId;

    @Column(name = "KO_NAME", length = 100, nullable = false)
    private String koName;

    @Column(name = "CN_NAME", length = 100, nullable = false)
    private String cnName;

    @Column(name = "EN_NAME", length = 100, nullable = false)
    private String enName;

    @Column(name = "PARENT_MENU_ID")
    private Integer parentMenuId;

    @Column(name = "DEPTH", nullable = false)
    private Integer depth;

    @Column(name = "PATH", length = 200, nullable = false)
    private String path;

    @Column(name = "COMPONENT_PATH", length = 200)
    private String componentPath;

    @Column(name = "POSITION", nullable = false)
    private Integer position;

    @Column(name = "CHILD_YN", length = 1)
    private String childYn = "N";

    @Column(name = "STATUS", length = 20)
    private String status = "ACTIVE";

    @Column(name = "CREATE_DATE", updatable = false)
    private LocalDateTime createDate;

    @Column(name = "CREATE_BY", length = 100, updatable = false)
    private String createBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "UPDATE_BY", length = 100)
    private String updateBy;
}