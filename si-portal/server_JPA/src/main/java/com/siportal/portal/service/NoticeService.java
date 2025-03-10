package com.siportal.portal.service;

import com.siportal.portal.domain.File;
import com.siportal.portal.domain.Notice;
import com.siportal.portal.repository.FileRepository;
import com.siportal.portal.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final FileRepository fileRepository;

    // 🔹 공지사항 등록 (Map 데이터 받아서 처리)
    public Notice createNoticeFromRequest(Map<String, Object> requestData) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        Notice notice = new Notice();
        notice.setTitle((String) requestData.get("title"));
        notice.setContent((String) requestData.get("content"));
        notice.setNoticeStart(LocalDateTime.parse((String) requestData.get("noticeStart"), formatter));
        notice.setNoticeEnd(LocalDateTime.parse((String) requestData.get("noticeEnd"), formatter));

        return noticeRepository.save(notice);
    }

    // 공지사항 목록 조회 (READ)
    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    // 특정 공지사항 조회 (READ)
    public Optional<Notice> getNoticeById(Long id) {
        return noticeRepository.findById(id);
    }

    // 공지사항 수정 (UPDATE)
    @Transactional
    public Notice updateNoticeFromRequest(Long id, Map<String, Object> requestData) {
        return noticeRepository.findById(id).map(notice -> {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

            notice.setTitle((String) requestData.get("title"));
            notice.setContent((String) requestData.get("content"));
            notice.setNoticeStart(LocalDateTime.parse((String) requestData.get("noticeStart"), formatter));
            notice.setNoticeEnd(LocalDateTime.parse((String) requestData.get("noticeEnd"), formatter));

            return noticeRepository.save(notice);
        }).orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없음: " + id));
    }

    // 🔹 공지사항 단일 삭제 (DELETE)
    public void deleteNotice(Long id) {
        noticeRepository.deleteById(id);
    }

    // 🔹 공지사항 다중 삭제 (DELETE)
    public void deleteNotices(List<Long> ids) {
        noticeRepository.deleteAllById(ids);
    }

    @Transactional
    public Notice createNoticeWithFile(Map<String, Object> requestData, MultipartFile file) throws IOException {
        Notice notice = new Notice();
        notice.setTitle((String) requestData.get("title"));
        notice.setContent((String) requestData.get("content"));
        notice.setNoticeStart(LocalDateTime.parse((String) requestData.get("noticeStart")));
        notice.setNoticeEnd(LocalDateTime.parse((String) requestData.get("noticeEnd")));

        if (file != null && !file.isEmpty()) {
            File savedFile = saveFile(file);
            notice.setFileId(savedFile.getFileId()); // ✅ 파일 ID 저장
        }

        return noticeRepository.save(notice);
    }

    private File saveFile(MultipartFile file) throws IOException {
        File pFile = new File();
        pFile.setFileName(file.getOriginalFilename());
        pFile.setFilePath("/uploads/" + file.getOriginalFilename()); // ✅ 실제 저장 경로
        pFile.setFileSize(file.getSize());

        return fileRepository.save(pFile);
    }
}
