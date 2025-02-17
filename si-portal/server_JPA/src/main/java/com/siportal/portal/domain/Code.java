package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "p_code")
@Getter
@Setter
@NoArgsConstructor
public class Code {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "code_id", nullable = false)
    private Integer codeId;  // 고유 ID

    @Column(name = "parent_id")
    private Integer parentId;  // 부모 코드, self-referencing 관계

    @Column(name = "code_name", length = 255)
    private String codeName;  // 코드 이름

    @Column(name = "default_text", length = 255)
    private String defaultText;  // 기본 텍스트

    @Column(name = "msg_id")
    private Integer msgId;  // 메시지 ID

    @Column(name = "level", nullable = false)
    private Integer level;  // 레벨 (계층 수준)

    @Column(name = "code_order")
    private Integer codeOrder;  // 코드 순서

    @Column(name = "status", length = 255)
    private String status;  // 상태

    @Column(name = "create_by", length = 255)
    private String createBy;  // 생성자

    @Column(name = "create_date")
    private LocalDateTime createDate;  // 생성 일시

    @Column(name = "update_by", length = 255)
    private String updateBy;  // 수정자

    @Column(name = "update_date")
    private LocalDateTime updateDate;  // 수정 일시

    @Column(name = "a_code", length = 255)
    private String aCode;  // a_code

    @Column(name = "b_code", length = 255)
    private String bCode;  // b_code

    @Column(name = "c_code", length = 255)
    private String cCode;  // c_code

    @Column(name = "d_code", length = 255)
    private String dCode;  // d_code

    @Column(name = "e_code", length = 255)
    private String eCode;  // e_code
}
