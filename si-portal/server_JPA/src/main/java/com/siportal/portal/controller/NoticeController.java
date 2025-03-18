package com.siportal.portal.controller;

import com.siportal.portal.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@RequestMapping("/notice") // API 기본 경로
@Transactional
public class NoticeController {

    private final NoticeService noticeService;

    @Autowired
    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    // 🔹 공지사항 목록 조회 (READ)
    @GetMapping("/api/get-notices")
    public ResponseEntity<List<?>> getNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    // 🔹 특정 공지사항 조회 (READ)
    @GetMapping("/api/get-notice")
    public ResponseEntity<?> getNotice(@RequestParam Long id) {
        return noticeService.getNoticeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 🔹 공지사항 추가 및 수정 (CREATE & UPDATE 통합)
    @PostMapping("/api/update-notices")
    public ResponseEntity<Map<String, String>> updateNotices(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(noticeService.updateNotices(requestData));
    }

    // 🔹 공지사항 삭제 (DELETE - 다중)
    @PostMapping("/api/delete-notices")
    public ResponseEntity<Map<String, String>> deleteNotices(@RequestBody Map<String, List<Long>> requestData) {
        noticeService.deleteNotices(requestData.get("deleteList"));
        return ResponseEntity.ok(Map.of("messageCode", "success", "message", "공지사항이 삭제되었습니다."));
    }
}
