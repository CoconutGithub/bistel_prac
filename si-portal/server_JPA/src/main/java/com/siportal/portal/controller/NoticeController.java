package com.siportal.portal.controller;

import com.siportal.portal.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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

    // 🔹 공지사항 목록 조회
    @GetMapping("/api/get-notices")
    public ResponseEntity<?> getNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    // 🔹 특정 공지사항 조회
    @GetMapping("/api/get-notice")
    public ResponseEntity<?> getNotice(@RequestParam Long id) {
        return ResponseEntity.ok(noticeService.getNoticeById(id));
    }

    // 🔹 공지사항 등록
    @PostMapping("/api/add-notice")
    public ResponseEntity<?> addNotice(@RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(noticeService.createNoticeFromRequest(requestData));
    }

    // 🔹 공지사항 수정
    @PostMapping("/api/update-notice")
    public ResponseEntity<?> updateNotice(@RequestParam Long id, @RequestBody Map<String, Object> requestData) {
        return ResponseEntity.ok(noticeService.updateNoticeFromRequest(id, requestData));
    }

    // 🔹 공지사항 삭제 (단일)
    @PostMapping("/api/delete-notice")
    public ResponseEntity<?> deleteNotice(@RequestParam Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }

    // 🔹 공지사항 삭제 (다중)
    @PostMapping("/api/delete-notices")
    public ResponseEntity<?> deleteNotices(@RequestBody Map<String, List<Long>> requestData) {
        List<Long> noticeIds = requestData.get("ids");
        noticeService.deleteNotices(noticeIds);
        return ResponseEntity.ok().build();
    }
}
