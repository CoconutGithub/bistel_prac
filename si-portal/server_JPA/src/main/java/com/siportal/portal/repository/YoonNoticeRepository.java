package com.siportal.portal.repository;

import com.siportal.portal.domain.Notice;
import com.siportal.portal.dto.NoticeDto;
import com.siportal.portal.dto.YoonNoticeDto;
import com.siportal.portal.dto.YoonNoticeProjection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YoonNoticeRepository extends JpaRepository<Notice, Long> { //ㅇㅎ 여기서 to_char로 받으니까 dto에서도 string으로 받아야지
  @Query(value = """
        SELECT 
            ROW_NUMBER() OVER (ORDER BY n.created_at DESC) as gridRowId,
            n.id as id,
            n.title as title, 
            n.content as content,
            --n.notice_start as noticeStart,
            --n.notice_end as noticeEnd,
            TO_CHAR(n.notice_start,'YYYY-MM-DD HH:MI') as noticeStart, 
            TO_CHAR(n.notice_end,'YYYY-MM-DD HH:MI') as noticeEnd, 
            n.file_id as fileId, 
            n.created_at as createdAt, 
            n.updated_at as updatedAt
        FROM p_notice n
        ORDER BY n.created_at DESC
    """, nativeQuery = true)
  List<YoonNoticeProjection> findAllBy();

  @Query("SELECT n FROM Notice n WHERE n.id = :id")
  NoticeDto findNoticeById(@Param("id") Long id);

  // 🔹 공지사항 삭제 (단일)
  void deleteById(Long id);

  // 🔹 공지사항 다중 삭제
  void deleteByIdIn(List<Long> ids); // 여러 개 삭제



  //deleteAllByIdInBatch
}
