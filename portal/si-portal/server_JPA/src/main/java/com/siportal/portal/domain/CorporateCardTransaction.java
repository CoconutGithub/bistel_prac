package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "corporate_card_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SequenceGenerator(
        name = "corporate_card_transaction_seq_generator",
        sequenceName = "corporate_card_transaction_seq",
        allocationSize = 10
)
public class CorporateCardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "corporate_card_transaction_seq_generator")
    private Integer id;

    @Column(name = "status")
    private String status;

    @Column(name = "approval_number", length = 30)
    private String approvalNumber;

    @Column(name = "approval_date", nullable = false)
    private LocalDateTime approvalDate;

    @Column(name = "card_type", length = 30)
    private String cardType;

    @Column(name = "is_cancelled")
    private Boolean isCancelled;

    @Column(name = "merchant_name", length = 200)
    private String merchantName;

    @Column(name = "merchant_category", length = 100)
    private String merchantCategory;

    @Column(name = "merchant_owner_name", length = 50)
    private String merchantOwnerName;

    @Column(name = "merchant_address", length = 255)
    private String merchantAddress;

    @Column(name = "card_company", length = 50)
    private String cardCompany;

    @Column(name = "card_number", length = 30)
    private String cardNumber;

    @Column(name = "transaction_amount")
    private Integer transactionAmount;

    @Column(name = "split_count")
    private Integer splitCount;

    @Column(name = "supply_amount")
    private Integer supplyAmount;

    @Column(name = "tax_amount")
    private Integer taxAmount;

    @Column(name = "business_registration_number", length = 20)
    private String businessRegistrationNumber;

    @Column(name = "account_name", length = 100)
    private String accountName;

    @Column(name = "project_code", length = 50)
    private String projectCode;

    @Column(name = "project_name", length = 100)
    private String projectName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_path", length = 500)
    private String filePath;

    @Column(name = "attach_rejection_reason", length = 500)
    private String attachRejectionReason;

    @Column(name = "pre_approval_file_name", length = 255)
    private String preApprovalFileName;

    @Column(name = "pre_approval_file_path", length = 500)
    private String preApprovalFilePath;

    // user_id 외래키 매핑
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user; // PUser 엔티티를 별도로 정의해야 함

    @Column(name = "user_id", insertable = false, updatable = false)
    private String userId;
}
