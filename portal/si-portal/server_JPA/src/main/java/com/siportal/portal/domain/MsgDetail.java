package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "p_msg_detail", schema = "dev")
@Getter
@Setter
@NoArgsConstructor
@IdClass(MsgDetail.PrimaryKey.class)  // 복합 키 클래스를 명시
public class MsgDetail {
    @Id
    @Column(name = "msg_id", nullable = false)
    private Integer msgId;

    @Id
    @Column(name = "lang_code", nullable = false)
    private String langCode;

    @Column(name = "lang_text", nullable = false)
    private String langText;

    @Column(name = "create_by")
    private String createBy;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "update_by")
    private String updateBy;

    @Column(name = "update_date")
    private LocalDateTime updateDate;

    @Getter
    @Setter
    @NoArgsConstructor
    @EqualsAndHashCode
    public static class PrimaryKey implements Serializable {
        private Integer msgId;
        private String langCode;
    }
}
