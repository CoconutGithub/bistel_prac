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
            ROW_NUMBER() OVER (ORDER BY n.create_date DESC) as grid_row_id,
            n.id, 
            n.title, 
            n.content, 
            n.notice_start, 
            n.notice_end, 
            n.file_id, 
            n.created_at, 
            n.updated_at
        FROM p_notice n
        ORDER BY n.create_date DESC
    """, nativeQuery = true)
    List<Object[]> getNoticeList();

    // 🔹 특정 공지사항 조회
    @Query("SELECT n FROM Notice n WHERE n.id = :id")
    NoticeDto findNoticeById(@Param("id") Long id);

    // 🔹 공지사항 삭제 (단일)
    void deleteById(Long id);

    // 🔹 공지사항 다중 삭제
    void deleteByIdIn(List<Long> ids); // 여러 개 삭제
}
