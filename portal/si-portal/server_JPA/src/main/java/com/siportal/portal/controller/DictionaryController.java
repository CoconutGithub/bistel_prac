package com.siportal.portal.controller;

import com.siportal.portal.domain.Dictionary;
import com.siportal.portal.service.DictionaryService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dictionary")
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping
    public List<Dictionary> list() {
        return dictionaryService.findAll();
    }

    @PostMapping
    public Dictionary create(@RequestBody DictionaryRequest request) {
        validateRequest(request);
        return dictionaryService.create(toEntity(request));
    }

    @PutMapping("/{id}")
    public Dictionary update(@PathVariable Long id, @RequestBody DictionaryRequest request) {
        validateRequest(request);
        Dictionary payload = toEntity(request);
        return dictionaryService.update(id, payload);
    }

    @PostMapping("/translate")
    public Map<String, String> translate(@RequestBody TranslateRequest request,
                                         @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (request == null || request.getKo() == null || request.getKo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "한국어 문구를 입력해주세요.");
        }
        return dictionaryService.translateFromKo(request.getKo(), authorization);
    }

    private Dictionary toEntity(DictionaryRequest request) {
        Dictionary dictionary = new Dictionary();
        dictionary.setDictKey(request.getDictKey());
        dictionary.setKo(request.getKo());
        dictionary.setEn(request.getEn());
        dictionary.setZh(request.getZh());
        dictionary.setVi(request.getVi());
        return dictionary;
    }

    private void validateRequest(DictionaryRequest request) {
        if (request == null
                || isBlank(request.getDictKey())
                || isBlank(request.getKo())
                || isBlank(request.getEn())
                || isBlank(request.getZh())
                || isBlank(request.getVi())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dict_key, ko, en, zh, vi를 모두 입력해주세요.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Getter
    @Setter
    public static class DictionaryRequest {
        private String dictKey;
        private String ko;
        private String en;
        private String zh;
        private String vi;
    }

    @Getter
    @Setter
    public static class TranslateRequest {
        private String ko;
    }
}
