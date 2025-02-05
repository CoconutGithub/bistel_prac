package com.siportal.portal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class UserRoleId implements Serializable {

    @Column(name = "USER_ID", length = 100, nullable = false)
    private String userId;

    @Column(name = "ROLE_ID", nullable = false)
    private Integer roleId;
}
