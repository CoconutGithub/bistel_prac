package com.siportal.portal.dto;

import lombok.Data;

@Data
public class User {

    private String userId;
    private String userName;
    private String password;
    private String email;
    private String status;
    private String phoneNumber;
    private String roleName;

    private String footerYN;
    private String headerColor;
}
