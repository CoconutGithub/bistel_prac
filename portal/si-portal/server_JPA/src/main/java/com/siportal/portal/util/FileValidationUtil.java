package com.siportal.portal.util;

import com.siportal.portal.com.error.ErrorCode;
import com.siportal.portal.com.exception.ApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Slf4j
public class FileValidationUtil {

    // 허용된 이미지 확장자
    public static final Set<String> ALLOWED_IMAGE_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "gif", "bmp", "webp");

    // 허용된 문서 확장자
    public static final Set<String> ALLOWED_DOCUMENT_EXTENSIONS =
            Set.of("pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt");

    // 일반적으로 허용되는 모든 확장자
    public static final Set<String> ALLOWED_ALL_EXTENSIONS =
            Set.of("jpg", "jpeg", "png", "gif", "bmp", "webp",
                    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt");

    // 허용된 MIME 타입
    public static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp"
    );

    public static final Set<String> ALLOWED_DOCUMENT_MIME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain"
    );

    // 기본 파일 크기 제한 (10MB)
    public static final long DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

    // 이미지 파일 크기 제한 (5MB)
    public static final long MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * 파일이 비어있는지 검증
     */
    public static void validateNotEmpty(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(ErrorCode.BAD_REQEUST, "파일이 비어있습니다.");
        }
    }

    /**
     * 파일명 검증
     */
    public static void validateFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new ApiException(ErrorCode.BAD_REQEUST, "파일명이 없습니다.");
        }

        // 경로 순회 공격 방지
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new ApiException(ErrorCode.BAD_REQEUST, "유효하지 않은 파일명입니다.");
        }

        // 파일명 길이 제한 (255자)
        if (fileName.length() > 255) {
            throw new ApiException(ErrorCode.BAD_REQEUST, "파일명이 너무 깁니다.");
        }
    }

    /**
     * 파일 확장자 검증
     */
    public static void validateFileExtension(String fileName, Set<String> allowedExtensions) {
        String extension = getFileExtension(fileName).toLowerCase();

        if (extension.isEmpty()) {
            throw new ApiException(ErrorCode.BAD_REQEUST, "파일 확장자가 없습니다.");
        }

        if (!allowedExtensions.contains(extension)) {
            throw new ApiException(ErrorCode.BAD_REQEUST,
                    String.format("허용되지 않는 파일 형식입니다. 허용된 확장자: %s", allowedExtensions)
            );
        }
    }

    /**
     * MIME 타입 검증
     */
    public static void validateMimeType(String mimeType, Set<String> allowedMimeTypes) {
        if (mimeType == null || mimeType.trim().isEmpty()) {
            throw new ApiException(ErrorCode.BAD_REQEUST, "MIME 타입이 없습니다.");
        }

        if (!allowedMimeTypes.contains(mimeType)) {
            throw new ApiException(ErrorCode.BAD_REQEUST,
                    String.format("허용되지 않는 파일 타입입니다. 현재: %s", mimeType)
            );
        }
    }

    /**
     * 파일 크기 검증
     */
    public static void validateFileSize(long fileSize, long maxFileSize) {
        if (fileSize <= 0) {
            throw new ApiException(ErrorCode.BAD_REQEUST, "파일 크기가 0입니다.");
        }

        if (fileSize > maxFileSize) {
            throw new ApiException(ErrorCode.BAD_REQEUST,
                    String.format("파일 크기가 너무 큽니다. 최대 크기: %d MB, 현재 크기: %.2f MB",
                            maxFileSize / (1024 * 1024),
                            (double) fileSize / (1024 * 1024))
            );
        }
    }

    /**
     * 파일 확장자 추출
     */
    public static String getFileExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return "";
        }

        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 && lastDotIndex < fileName.length() - 1
                ? fileName.substring(lastDotIndex + 1)
                : "";
    }

    /**
     * 파일명 정규화 (안전한 파일명으로 변환)
     */
    public static String sanitizeFileName(String fileName) {
        if (fileName == null) {
            return "unnamed_file";
        }

        // 위험한 문자들을 언더스코어로 치환
        return fileName.replaceAll("[^a-zA-Z0-9가-힣._-]", "_")
                .replaceAll("_{2,}", "_"); // 연속된 언더스코어 정리
    }

    /**
     * 이미지 파일 종합 검증
     */
    public static void validateImageFile(MultipartFile file) {
        validateNotEmpty(file);
        validateFileName(file.getOriginalFilename());
        validateFileExtension(file.getOriginalFilename(), ALLOWED_IMAGE_EXTENSIONS);
        validateMimeType(file.getContentType(), ALLOWED_IMAGE_MIME_TYPES);
    }

    /**
     * 문서 파일 종합 검증
     */
    public static void validateDocumentFile(MultipartFile file) {
        validateNotEmpty(file);
        validateFileName(file.getOriginalFilename());
        validateFileExtension(file.getOriginalFilename(), ALLOWED_DOCUMENT_EXTENSIONS);
        validateMimeType(file.getContentType(), ALLOWED_DOCUMENT_MIME_TYPES);
    }

    /**
     * 일반 파일 종합 검증 (커스텀 설정)
     */
    public static void validateFile(MultipartFile file,
                                    Set<String> allowedExtensions,
                                    Set<String> allowedMimeTypes,
                                    long maxFileSize) {
        validateNotEmpty(file);
        validateFileName(file.getOriginalFilename());
        validateFileExtension(file.getOriginalFilename(), allowedExtensions);
        validateFileSize(file.getSize(), maxFileSize);
    }

    /**
     * 파일이 이미지인지 확인
     */
    public static boolean isImageFile(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return ALLOWED_IMAGE_EXTENSIONS.contains(extension);
    }

    /**
     * 파일이 문서인지 확인
     */
    public static boolean isDocumentFile(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        return ALLOWED_DOCUMENT_EXTENSIONS.contains(extension);
    }

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 변환
     */
    public static String formatFileSize(long sizeInBytes) {
        if (sizeInBytes < 1024) {
            return sizeInBytes + " B";
        } else if (sizeInBytes < 1024 * 1024) {
            return String.format("%.1f KB", sizeInBytes / 1024.0);
        } else if (sizeInBytes < 1024 * 1024 * 1024) {
            return String.format("%.1f MB", sizeInBytes / (1024.0 * 1024.0));
        } else {
            return String.format("%.1f GB", sizeInBytes / (1024.0 * 1024.0 * 1024.0));
        }
    }
}
