package com.siportal.portal.repository;

import com.siportal.portal.domain.Notice;
import com.siportal.portal.dto.NoticeDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {

    List<Notice> findAllByOrderByCreatedAtDesc();

    // 🔹 공지사항 목록 조회 (최신순 정렬)
    @Query(value = """
        SELECT 
            ROW_NUMBER() OVER (ORDER BY n.created_at DESC) as grid_row_id,
            n.id, 
            n.title, 
            n.content, 
            n.notice_start, 
            n.notice_end, 
            n.file_id, 
            n.created_at, 
            n.updated_at
        FROM p_notice n
        ORDER BY n.created_at DESC
    """, nativeQuery = true)
    List<Object[]> getNoticeList();

    // 🔹 특정 공지사항 조회 (DTO로 변환)
    @Query("SELECT new com.siportal.portal.dto.NoticeDto(n.id, n.title, n.content, n.noticeStart, n.noticeEnd, n.fileId, n.createdAt, n.updatedAt) FROM Notice n WHERE n.id = :id")
    Notice findNoticeById(@Param("id") Long id);

    // 🔹 공지사항 등록 (INSERT)
    @Query(value = """
        INSERT INTO p_notice (title, content, notice_start, notice_end, file_id, created_at, updated_at)
        VALUES (:title, :content, :noticeStart, :noticeEnd, :fileId, NOW(), NOW())
        RETURNING id
    """, nativeQuery = true)
    Long createNotice(
            @Param("title") String title,
            @Param("content") String content,
            @Param("noticeStart") String noticeStart,
            @Param("noticeEnd") String noticeEnd,
            @Param("fileId") Long fileId
    );

    // 🔹 공지사항 수정 (UPDATE)
    @Query(value = """
        UPDATE p_notice 
        SET title = :title, 
            content = :content, 
            notice_start = :noticeStart, 
            notice_end = :noticeEnd, 
            file_id = :fileId, 
            updated_at = NOW()
        WHERE id = :id
    """, nativeQuery = true)
    void updateNotice(
            @Param("id") Long id,
            @Param("title") String title,
            @Param("content") String content,
            @Param("noticeStart") String noticeStart,
            @Param("noticeEnd") String noticeEnd,
            @Param("fileId") Long fileId
    );

    // 🔹 공지사항 삭제 (단일)
    void deleteById(Long id);

    // 🔹 공지사항 다중 삭제
    void deleteByIdIn(List<Long> ids);
}
