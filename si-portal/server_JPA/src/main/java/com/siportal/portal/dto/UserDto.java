package com.siportal.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserDto {

    private String userId;
    private String userName;
    private String email;
    private String phoneNumber;
    private String status;
    private String password;
    private String roleName;
    private String footerYN;
    private String headerColor;
    private String roleId;
    private String isMighty;
    private String langCode;

}
