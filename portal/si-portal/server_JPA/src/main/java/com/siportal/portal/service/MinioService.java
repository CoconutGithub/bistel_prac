package com.siportal.portal.service;

import com.siportal.portal.com.error.ErrorCode;
import com.siportal.portal.com.error.FileErrorCode;
import com.siportal.portal.com.exception.ApiException;
import com.siportal.portal.dto.cct.CctSaveAttachResponse;
import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Item;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.cct-bucket-name}")
    private String cctBucketName;

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public String generatePresignedUrl(String fileName) {
        try {

            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);

            String presignedUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(bucketName)
                            .object(encodedFileName)
                            .expiry(10, TimeUnit.MINUTES)
                            .build()
            );


            return presignedUrl;
        } catch (Exception e) {
            throw new RuntimeException("Presigned URL 생성 실패: " + e.getMessage());
        }
    }

    /**
     * 파일을 다운로드 할 수 있는 링크 생성 메서드
     * */
    public String generateDownloadUrl(String fileName) {
        try {
            String downloadUrl = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(cctBucketName)
                            .object(fileName)
                            .expiry(12, TimeUnit.HOURS)
                            .build()
            );

            return downloadUrl;
        } catch (Exception e) {
            throw new RuntimeException("다운로드 URL 생성 실패: " + e.getMessage());
        }
    }

    /**
     * MultipartFile을 MinIO에 저장
     * @param file 업로드할 파일
     * @param fileName 업로드할 파일의 이름 지정
     * @return 저장된 파일의 객체명(경로)
     */
    public CctSaveAttachResponse saveObject(String userId,
                                            String cctId,
                                            MultipartFile file,
                                            String fileName,
                                            Boolean isOverwrite
    ) {
        // 파일 업로드
        String objectName = fileName == null ? file.getOriginalFilename(): fileName;

//        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String folderPath = String.format("user/%s/%s", userId, cctId);
        String fullPath = folderPath + "/" + objectName;

        // 파일 overwrite check
        if (isOverwrite == false) {
            if (fileExists(folderPath + objectName)) {
                throw new ApiException(FileErrorCode.FILE_ALREADY_EXISTS, "이미 존재하는 파일 이름입니다. 새로운 파일로 덮어쓰시겠습니까?");
            }
        }

        // input stream
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(cctBucketName)
                            .object(fullPath)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        } catch (Exception e) {
            log.error("failed to save object: " + e.getMessage(), e);
            throw new ApiException(FileErrorCode.FAILED_FILE_SAVE);
        }

        String downloadUrl = generateDownloadUrl(fullPath);

        return CctSaveAttachResponse.builder()
                .filePath(fullPath)
                .fileName(objectName)
                .bucket(cctBucketName)
                .downloadUrl(downloadUrl)
                .build();

    }

    /**
     * MultipartFile을 MinIO에 저장
     * @param file 업로드할 파일
     * @param fileName 업로드할 파일의 이름 지정
     * @return 저장된 파일의 객체명(경로)
     */
    public String saveTempObjectByUser(String userId, MultipartFile file, String fileName) {
        try {
            // 파일 업로드
            String objectName = fileName == null ? file.getOriginalFilename(): fileName;

            String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String folderPath = String.format("user/temp/%s/%s/", userId, date);

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(folderPath+objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return objectName;

        } catch (Exception e) {
            throw new RuntimeException("파일 저장 실패: " + e.getMessage());
        }
    }

    /**
     * MultipartFile을 MinIO에 저장
     * @param file 업로드할 파일
     * @param fileName 업로드할 파일의 이름 지정
     * @return 저장된 파일의 객체명(경로)
     */
    public String savePersistenceObjectByUser(String userId, MultipartFile file, String fileName) {
        try {
            // 파일 업로드
            String objectName = fileName == null ? file.getOriginalFilename(): fileName;

            String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String persistencePath = String.format("user/%s/%s/", userId, date);
            String tempPath = String.format("user/temp/%s/%s/", userId, date);


            if (!fileExists(tempPath+objectName)) {

                String previousDate = LocalDate.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                String previousTempPath = String.format("user/temp/%s/%s/", userId, previousDate);

                if(!fileExists(previousTempPath+objectName)) {
                    throw new ApiException(ErrorCode.BAD_REQEUST, "잘못된 파일 저장입니다. 다시 시도해주세요.");
                }
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(persistencePath+objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            return objectName;

        } catch (Exception e) {
            log.error("throw exception - persistence file process: ", e);
            throw new ApiException(ErrorCode.SERVER_ERROR, "파일 저장 실패: " + e.getMessage());
        }
    }

    /**
     * 파일 존재 여부 확인
     * @param objectName 확인할 객체명
     * @return 존재 여부
     */
    public boolean fileExists(String objectName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(cctBucketName)
                            .object(objectName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 파일 삭제
     * @param objectName 삭제할 객체명
     */
    public void deleteFile(String objectName) {

        try {
            String decodedName = URLDecoder.decode(objectName, StandardCharsets.UTF_8);
            log.info("file exists text after url decode: {}, valid : {}", decodedName, fileExists(objectName));
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(cctBucketName)
                            .object(decodedName)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("파일 삭제 실패: " + e.getMessage());
        }
    }

    /**
     * 파일 다운로드 URL 생성
     * @param objectName 객체명
     * @param expiry 만료 시간
     * @param unit 시간 단위
     * @return 다운로드 URL
     */
    public String getDownloadUrl(String objectName, int expiry, TimeUnit unit) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(cctBucketName)
                            .object(objectName)
                            .expiry(expiry, unit)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("다운로드 URL 생성 실패: " + e.getMessage());
        }
    }

    public List<CctSaveAttachResponse> getPrefixFileList(
            String prefix
    ) {

        Iterable<Result<Item>> results = minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(cctBucketName)
                        .prefix(prefix)
                        .recursive(false)
                        .build()
        );

        List<CctSaveAttachResponse> attachList = new ArrayList<>();

        for  (Result<Item> result : results) {
            try{
                Item item = result.get();

                String fullPath = item.objectName();
                String objectName = fullPath.substring(fullPath.lastIndexOf("/") + 1);
                String downloadUrl = generateDownloadUrl(fullPath);

                var attach = CctSaveAttachResponse.builder()
                        .bucket(cctBucketName)
                        .filePath(fullPath)
                        .fileName(objectName)
                        .downloadUrl(downloadUrl)
                        .build();

                attachList.add(attach);
            }catch (Exception e){
                throw new ApiException(FileErrorCode.FAILED_FILE_GET);
            }
        }

        return attachList;
    }

    public void moveFile(String currentFilePath, String updateFilePath) {
        boolean isFileValid = fileExists(currentFilePath);

        if(!isFileValid) {
            throw new ApiException(FileErrorCode.FILE_NOT_FOUND);
        }
        try{
            minioClient.copyObject(
                    CopyObjectArgs.builder()
                            .bucket(cctBucketName)
                            .object(updateFilePath)
                            .source(
                                    CopySource.builder()
                                            .bucket(cctBucketName)
                                            .object(currentFilePath)
                                            .build()
                            )
                            .build()
            );

            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(cctBucketName)
                            .object(currentFilePath)
                            .build()
            );
        }catch (Exception e){
            throw new ApiException(FileErrorCode.FAILED_FILE_UPDATE);
        }
    }
}
