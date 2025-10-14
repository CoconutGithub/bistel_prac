package com.siportal.portal.controller.biz;
import com.siportal.portal.dto.ChatbotRequestDTO;
import com.siportal.portal.service.RagChatbotService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.FileCopyUtils;
import org.springframework.core.io.FileSystemResource;
import com.siportal.portal.service.WebClientService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;


import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/biz/chatbot")
public class ChatbotController {

    @Autowired
//    private RagChatbotService ragChatbotService;
    private WebClientService webClientService;

    @PostMapping("/ask")
    public Mono<ResponseEntity<String>> ask(@RequestBody ChatbotRequestDTO request,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader) {
        System.out.println("@@request"+request);
        System.out.println("Auth Header: " + authHeader);
        return webClientService.analyzeQuestion(request.getQuestion())
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("오류 발생: " + e.getMessage())));
}

    // SSE 스트리밍 응답 방식
    @PostMapping(value = "/ask-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> askStream(@RequestBody ChatbotRequestDTO request,
                                  @RequestHeader(value = "Authorization", required = false) String authHeader,
                                  HttpServletResponse response) {
        System.out.println("Received Authorization header: " + authHeader);
        return webClientService.streamAnswer(request.getQuestion())
                .doOnError(e -> {
                    System.err.println("[CONTROLLER] Stream error: " + e.getMessage());
                })
                .doFinally(signal -> System.out.println("[CONTROLLER] Stream finished: " + signal));
    }


    // 파일 업로드
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<String>> uploadFiles(@RequestParam("files") MultipartFile[] files,
                                                    @RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (files.length == 0) {
            return Mono.just(ResponseEntity.badRequest().body("업로드할 파일이 없습니다."));
        }

        try {
            // 단일 파일 처리 (Python 서버가 단일 파일만 받는 경우)
            File tempFile = convertToFile(files[0]);
            return webClientService.uploadFile(tempFile)
                    .map(ResponseEntity::ok)
                    .doFinally(signalType -> tempFile.delete());
        } catch (IOException e) {
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("파일 변환 중 오류 발생: " + e.getMessage()));
        }
    }

    // MultipartFile → File 변환 유틸
    private File convertToFile(MultipartFile multipartFile) throws IOException {
        File convFile = File.createTempFile("upload-", multipartFile.getOriginalFilename());
        FileCopyUtils.copy(multipartFile.getBytes(), convFile);
        return convFile;
    }
}
