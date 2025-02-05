package com.siportal.portal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
@Table(name = "P_USER")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @Column(name = "USER_ID", length = 100, nullable = false)
    private String userId;

    @Column(name = "USER_NAME", length = 100, nullable = false)
    private String userName;

    @Column(name = "PASSWORD", length = 300, nullable = false)
    private String password;

    @Column(name = "EMAIL", length = 100)
    private String email;

    @Column(name = "PHONE_NUMBER", length = 20)
    private String phoneNumber;

    @Column(name = "LAST_LOGIN_DATE")
    private LocalDateTime lastLoginDate;

    @Column(name = "STATUS", length = 20)
    private String status = "INACTIVE";

    @Column(name = "FOOTER_YN", length = 1)
    private String footerYn = "Y";

    @Column(name = "HEADER_COLOR", length = 20)
    private String headerColor = "#f8f9fa";

    @Lob
    @Column(name = "PROFILE_IMAGE")
    private byte[] profileImage;

    @Column(name = "CREATE_DATE", updatable = false)
    private LocalDateTime createDate;

    @Column(name = "CREATE_BY", length = 100, updatable = false)
    private String createBy;

    @Column(name = "UPDATE_DATE")
    private LocalDateTime updateDate;

    @Column(name = "UPDATE_BY", length = 100)
    private String updateBy;
}