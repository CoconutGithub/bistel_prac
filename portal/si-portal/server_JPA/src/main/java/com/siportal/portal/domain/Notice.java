package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "p_notice")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // 공지사항 ID

    @Column(nullable = false, length = 300)
    private String title;  // 공지 제목

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;  // 공지 내용

    @Column(name = "notice_start", nullable = false)
    private LocalDateTime noticeStart;  // 공지 시작일

    @Column(name = "notice_end", nullable = false)
    private LocalDateTime noticeEnd;  // 공지 종료일

    @Column(name = "file_id")
    private Long fileId;  // 첨부파일 ID (p_file 테이블 참조)

    @OneToOne(fetch = FetchType.LAZY) // ✅ 파일 정보 가져오기
    @JoinColumn(name = "file_id", referencedColumnName = "file_id", insertable = false, updatable = false)
    private File file;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();  // 생성일

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();  // 수정일

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();  // 업데이트 시 자동 변경
    }

//    public Notice update(){
//
//    }
}
