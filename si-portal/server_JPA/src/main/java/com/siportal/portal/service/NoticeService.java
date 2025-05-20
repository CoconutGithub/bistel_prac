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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final FileRepository fileRepository;
//    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    // 🔹 공지사항 목록 조회 (READ)
    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    // 🔹 특정 공지사항 조회 (READ)
    public Optional<Notice> getNoticeById(Long id) {
        return noticeRepository.findById(id);
    }

    // 🔹 공지사항 추가 및 수정 (CREATE & UPDATE)
    @Transactional(rollbackFor = Exception.class)
    public void updateNotices(Map<String, Object> requestData) throws Exception {
            List<Map<String, Object>> createList = (List<Map<String, Object>>) requestData.get("createList");
            List<Map<String, Object>> updateList = (List<Map<String, Object>>) requestData.get("updateList");
            List<Long> deleteList = (List<Long>) requestData.get("deleteList");

            if (createList != null) {
                createList.forEach(this::processNoticeData);
            }

            if (updateList != null) {
                updateList.forEach(this::updateExistingNotice);
            }

            if (deleteList != null && !deleteList.isEmpty()) {
                deleteNotices(deleteList);
            }

//            return Map.of("messageCode", "success", "message", "공지사항이 저장되었습니다.");
//        } catch (Exception e) {
//            return Map.of("messageCode", "error", "message", "공지사항 저장 실패: " + e.getMessage());
//        }
    }

    // 🔹 공지사항 데이터 처리 (CREATE)
    private void processNoticeData(Map<String, Object> data) {
        Notice notice = new Notice();
        notice.setTitle((String) data.get("title"));
        notice.setContent((String) data.get("content"));
        notice.setNoticeStart(LocalDateTime.parse((String) data.get("noticeStart"), formatter));
        notice.setNoticeEnd(LocalDateTime.parse((String) data.get("noticeEnd"), formatter));

        noticeRepository.save(notice);
    }

    // 🔹 기존 공지사항 수정 (UPDATE)
    private void updateExistingNotice(Map<String, Object> data) {
        Long id = ((Number) data.get("id")).longValue();
        Optional<Notice> existingNotice = noticeRepository.findById(id);

        existingNotice.ifPresent(notice -> {
            notice.setTitle((String) data.get("title"));
            notice.setContent((String) data.get("content"));
            notice.setNoticeStart(LocalDateTime.parse((String) data.get("noticeStart"), formatter));
            notice.setNoticeEnd(LocalDateTime.parse((String) data.get("noticeEnd"), formatter));

            noticeRepository.save(notice);
        });
    }

    // 🔹 공지사항 삭제 (DELETE)
    @Transactional
    public void deleteNotices(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("삭제할 공지사항 ID 목록이 비어 있습니다.");
        }
        noticeRepository.deleteAllById(ids);
    }

    // 🔹 공지사항 추가 (파일 포함)
    @Transactional
    public Notice createNoticeWithFile(Map<String, Object> requestData, MultipartFile file) throws IOException {
        Notice notice = new Notice();
        notice.setTitle((String) requestData.get("title"));
        notice.setContent((String) requestData.get("content"));
        notice.setNoticeStart(LocalDateTime.parse((String) requestData.get("noticeStart"), formatter));
        notice.setNoticeEnd(LocalDateTime.parse((String) requestData.get("noticeEnd"), formatter));

        if (file != null && !file.isEmpty()) {
            File savedFile = handleFileUpload(file);
            notice.setFileId(savedFile.getFileId()); // ✅ 파일 ID 저장
        }

        return noticeRepository.save(notice);
    }

    // 🔹 파일 저장 처리
    private File handleFileUpload(MultipartFile file) throws IOException {
        File pFile = new File();
        pFile.setFileName(file.getOriginalFilename());
        pFile.setFilePath("/uploads/" + file.getOriginalFilename()); // ✅ 실제 저장 경로
        pFile.setFileSize(file.getSize());

        return fileRepository.save(pFile);
    }
}
