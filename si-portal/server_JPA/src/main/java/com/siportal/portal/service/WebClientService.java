package com.siportal.portal.service;

import com.siportal.portal.dto.ChatbotRequestDTO;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import org.springframework.http.HttpStatus;

@Service
public class WebClientService {

    @Autowired
    private WebClient webClient;
    private static final Logger logger = LoggerFactory.getLogger(WebClientService.class);
    private static final String ASK_ENDPOINT = "/ask";
    private static final String ASK_STREAM_ENDPOINT = "/ask-stream";
    private static final String UPLOAD_ENDPOINT = "/upload";

    // 일반 질문 분석 (단건 응답)
    public Mono<String> analyzeQuestion(String question) {
        System.out.println("@@@" + question);
        return webClient.post()
                .uri("/ask")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("{\"question\": \"" + question + "\"}")
                .retrieve()
                .bodyToMono(String.class)
                .map(responseStr -> {
                    System.out.println("✅ 응답 바디: " + responseStr);
                    return responseStr;
                })
                .onErrorResume(e -> {
                    e.printStackTrace();
                    System.out.println("@@@" + e);
                    return Mono.just("⚠️ 예외 발생: " + e.getMessage());
                });
    }

    // stream 응답
    public Flux<String> streamAnswer(String question) {
        logger.info("[SERVICE_STREAM_ANSWER] FastAPI 스트림 요청 시작. 질문: '{}'", question);

        String fastApiUri = "/ask-stream";

        return this.webClient
                .post()
                .uri(fastApiUri)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .acceptCharset(StandardCharsets.UTF_8)
                .bodyValue(Map.of("question", question))
                .retrieve()
                // HTTP 4xx 또는 5xx 에러 발생 시 WebClientResponseException으로 변환하여 onError 신호로 전파
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(errorBody -> {
                                    logger.error("[WEBCLIENT_ON_STATUS] FastAPI 오류 응답. 상태: {}, 본문: {}", clientResponse.statusCode(), errorBody);
                                    return Mono.error(new WebClientResponseException(
                                            "FastAPI 오류 응답: " + clientResponse.statusCode().value() + ", 본문: " + errorBody,
                                            clientResponse.statusCode().value(),
                                            HttpStatus.valueOf(clientResponse.statusCode().value()).getReasonPhrase(),
                                            clientResponse.headers().asHttpHeaders(),
                                            errorBody.getBytes(StandardCharsets.UTF_8),
                                            StandardCharsets.UTF_8
                                    ));
                                })
                )
                .bodyToFlux(String.class)
                .map(chunk -> {
                    // FastAPI가 보내는 SSE 청크 형식에 의존적인 파싱 로직
                    String trimmedChunk = chunk.trim();

                    if (trimmedChunk.startsWith("data:")) {
                        return trimmedChunk.substring(5).trim();
                    } else if (trimmedChunk.startsWith("event: complete")) { // FastAPI에서 이런 이벤트를 보낸다면
                        logger.debug("[WEBCLIENT_FLUX_MAP] 'event: complete' 수신. 필터링 대상."); // 이벤트 완료는 DEBUG 레벨로
                        return ""; // 빈 문자열로 만들어 아래 filter에서 제거
                    } else if (trimmedChunk.isEmpty()) {
                        // SSE 이벤트는 \n\n으로 구분되므로, 빈 줄은 정상적인 부분일 수 있습니다. 필터링 대상.
                        return "";
                    }
                    // 예상치 못한 형식의 청크는 경고 로그를 남기고 그대로 반환 (필터링 될 수 있음)
                    logger.warn("[WEBCLIENT_FLUX_MAP_UNEXPECTED] 예상치 못한 청크 형식: '{}'", trimmedChunk.replace("\n", "\\n"));
                    return trimmedChunk;
                })
                .filter(data -> data != null && !data.isEmpty()) // null이거나 비어있지 않은 데이터만 통과
                .doOnComplete(() -> logger.info("[WEBCLIENT_FLUX] FastAPI 스트림 처리 완료."))
                .doOnError(error -> {
                    if (!(error instanceof WebClientResponseException)) {
                        logger.error("[WEBCLIENT_FLUX_ON_ERROR] WebClient 스트림 처리 중 오류 발생: {} - {}", error.getClass().getName(), error.getMessage(), error);
                    }

                })
                // Flux 전체 작업 시간(구독 시작부터 onComplete/onError 까지)에 대한 타임아웃
                // HttpClient의 responseTimeout
                .timeout(Duration.ofSeconds(70))
                .doFinally(signalType -> logger.info("[WEBCLIENT_FLUX] WebClient Flux 스트림 종료. 시그널: {}", signalType)) // 스트림 종료 시그널은 INFO로 유지하여 모니터링
                .doOnCancel(() -> logger.warn("[WEBCLIENT_FLUX] WebClient Flux 스트림 취소됨."));
    }


    // 파일 업로드
    public Mono<String> uploadFile(File file) {
        Resource fileResource = new FileSystemResource(file);

        return webClient.post()
                .uri(UPLOAD_ENDPOINT)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", fileResource))
                .retrieve()
                .bodyToMono(String.class);
    }
}
