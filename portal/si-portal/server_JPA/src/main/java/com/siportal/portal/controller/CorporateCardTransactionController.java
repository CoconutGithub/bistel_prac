package com.siportal.portal.controller;

import com.siportal.portal.com.api.Api;
import com.siportal.portal.dto.cct.CctPatchAttachRequest;
import com.siportal.portal.dto.cct.CctPatchRequest;
import com.siportal.portal.dto.cct.CctSaveAttachResponse;
import com.siportal.portal.service.CorporateCardTransactionService;
import com.siportal.portal.service.MinioService;
import com.siportal.portal.util.FileValidationUtil;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/cct")
public class CorporateCardTransactionController {

    private final CorporateCardTransactionService corporateCardTransactionService;
    private final MinioService minioService;

    @GetMapping("")
    public ResponseEntity<?> getCorporateCardTransactionBetweenDates(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        var response = corporateCardTransactionService.getCorporateCardTransactionBetweenDates(
                userId, startDate, endDate
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/account-names")
    public ResponseEntity<?> getAccountNames() {
        var response = corporateCardTransactionService.getAccountNames();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("")
    public Api<?> updateCctRows(
            @RequestBody List<CctPatchRequest> request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        corporateCardTransactionService.patchCcts(userId, request);

        return Api.OK(null);
    }

    @PostMapping("/upload/attach")
    public Api<?> uploadAttachFiles(
            @RequestPart(name = "file") MultipartFile uploadFile,
            @RequestPart(name = "cctId") String cctId,
            @RequestPart(required = false, name = "isOverwrite") Boolean isOverwrite
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        if (isOverwrite == null) {
            isOverwrite = false;
        }

        // file validation - filename, file extension
        FileValidationUtil.validateFile(
                uploadFile,
                FileValidationUtil.ALLOWED_ALL_EXTENSIONS,
                Set.of(),
                FileValidationUtil.DEFAULT_MAX_FILE_SIZE);

        String filename = uploadFile.getOriginalFilename();

        var response = minioService.saveObject(userId, cctId, uploadFile, filename, isOverwrite);

        return Api.OK(response);
    }

    @PostMapping(value = "/upload/attaches", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Api<?> uploadAttachFiles(
            @RequestPart(name = "files") List<MultipartFile> uploadFiles,
            @RequestParam(name = "cctId") String cctId,
            @RequestParam(required = false, name = "isOverwrite") Boolean isOverwrite
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        if (isOverwrite == null) {
            isOverwrite = false;
        }

        List<Map<String, Object>> fileMapList = new ArrayList<>();

        // file list validation
        for (MultipartFile file : uploadFiles) {
            // file validation - fileName, file extension
            FileValidationUtil.validateFile(
                    file,
                    FileValidationUtil.ALLOWED_ALL_EXTENSIONS,
                    Set.of(),
                    FileValidationUtil.DEFAULT_MAX_FILE_SIZE);

            String filename = file.getOriginalFilename();

            Map<String, Object> fileMap = new HashMap<>();
            fileMap.put("filename", filename);
            fileMap.put("file", file);

            fileMapList.add(fileMap);
        }

        // file list save
        List<CctSaveAttachResponse> response = new ArrayList<>();
        for (Map<String, Object> fileMap : fileMapList) {
            MultipartFile file = (MultipartFile) fileMap.get("file");
            String filename = (String) fileMap.get("filename");

            var saveObjectInfo = minioService.saveObject(userId, cctId, file, filename, isOverwrite);
            response.add(saveObjectInfo);
        }
        return Api.OK(response);
    }

    @Operation(
            summary = "결제 내역 첨부 파일 리스트 조회"
    )
    @GetMapping("/{cctId}/attach")
    public Api<?> getUserAttachFiles(
            @PathVariable(name = "cctId") String cctId
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        String prefixPath = String.format("user/%s/%s/", userId, cctId);
        List<CctSaveAttachResponse> response = minioService.getPrefixFileList(prefixPath);
        return Api.OK(response);
    }

    @DeleteMapping("/attach")
    public Api<?> deleteAttachFile(
            @RequestParam(name = "cctId") Integer cctId,
            @RequestParam(name = "fileName") String fileName
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        corporateCardTransactionService.isCctOwner(userId, cctId);

        String filePath = String.format("user/%s/%s/%s", userId, cctId, fileName);
        minioService.deleteFile(filePath);

        return Api.OK(null);
    }

    @PatchMapping("/attach")
    public Api<?> updateAttachFileName(
            @RequestBody CctPatchAttachRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = (String) authentication.getPrincipal();

        corporateCardTransactionService.isCctOwner(userId, request.getCctId());

        String currentFilePath =  String.format("user/%s/%s/%s", userId, request.getCctId(), request.getCurrentFileName());
        String updateFilePath = String.format("user/%s/%s/%s", userId, request.getCctId(), request.getUpdateFileName());

        minioService.moveFile(currentFilePath, updateFilePath);

        return Api.OK(null);
    }
}
