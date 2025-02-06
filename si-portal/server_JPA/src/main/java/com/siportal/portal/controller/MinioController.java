package com.siportal.portal.controller;

import com.siportal.portal.service.MinioService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/minio")
public class MinioController {

    private final MinioService minioService;

    public MinioController(MinioService minioService) {
        this.minioService = minioService;
    }

    @PostMapping("/presigned-url")
    public Map<String, String> getPresignedUrl(@RequestParam String fileName) {
        String presignedUrl = minioService.generatePresignedUrl(fileName);

        String fileUrl = "http://localhost:9000/siportal" + fileName;

        Map<String, String> response = new HashMap<>();
        response.put("presignedUrl", presignedUrl);
        response.put("fileUrl", fileUrl);
        return response;
    }
}
