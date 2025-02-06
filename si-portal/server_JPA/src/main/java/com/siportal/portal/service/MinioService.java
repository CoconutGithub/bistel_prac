package com.siportal.portal.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@Service
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

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


}
