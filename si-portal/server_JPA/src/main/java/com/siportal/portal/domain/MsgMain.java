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
public class MsgMain {
    @Id
    @Column(name = "msg_id")
    private Integer msgId;

    @Column(name = "msg_type", nullable = false)
    private String msgType;

    @Column(name = "msg_name", nullable = false)
    private String msgName;

    @Column(name = "msg_default", nullable = false)
    private String msgDefault;

    @Column(name = "status")
    private String status = "ACTIVE"; // 기본값 설정

    @Column(name = "create_by")
    private String createBy;

    @Column(name = "create_date")
    private LocalDateTime createDate;

    @Column(name = "update_by")
    private String updateBy;

    @Column(name = "update_date")
    private LocalDateTime updateDate;
}
