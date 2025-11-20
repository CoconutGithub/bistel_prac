package com.siportal.portal.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorporateCardTransactionDto {
    private Integer id;
    private String status;
    private String approvalNumber;
    private LocalDateTime approvalDate;
    private String cardType;
    private Boolean isCancelled;
    private String merchantName;
    private String merchantCategory;
    private Integer transactionAmount;
    private Integer splitCount;
    private Integer supplyAmount;
    private Integer taxAmount;
    private String accountName;
    private String projectCode;
    private String projectName;
    private String description;
    private LocalDateTime transactionDate;
    private String fileName;
    private String filePath;
    private String attachRejectionReason;
    private String preApprovalFileName;
    private String preApprovalFilePath;
    private String userId;
    private String merchantOwnerName;
    private String merchantAddress;
    private String cardCompany;
    private String cardNumber;
    private String businessRegistrationNumber;
}
