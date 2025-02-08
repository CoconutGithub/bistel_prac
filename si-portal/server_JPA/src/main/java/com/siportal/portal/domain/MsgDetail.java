package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "p_msg_main", schema = "dev")
@Getter
@Setter
@NoArgsConstructor
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
}
