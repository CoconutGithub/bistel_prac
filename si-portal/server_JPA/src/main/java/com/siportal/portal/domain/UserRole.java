package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "P_USER_ROLE")
@Getter
@Setter
@NoArgsConstructor
@IdClass(UserRole.PrimaryKey.class)  // 복합 키 클래스를 명시
public class UserRole {

    @Id
    @Column(name = "USER_ID", length = 100, nullable = false)
    private String userId;

    @Id
    @Column(name = "ROLE_ID", nullable = false)
    private Integer roleId;

    @Column(name = "CREATE_DATE", updatable = false)
    private LocalDateTime createDate;

    @Column(name = "CREATE_BY", length = 100, updatable = false)
    private String createBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "UPDATE_BY", length = 100)
    private String updateBy;

    // 내부 클래스로 복합 키 정의
    @Getter
    @Setter
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class PrimaryKey implements Serializable {
        private String userId;
        private Integer roleId;
    }
}
