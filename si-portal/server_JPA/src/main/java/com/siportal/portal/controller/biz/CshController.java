package com.siportal.portal.controller.biz;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.siportal.portal.service.CshService;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://192.168.7.37:9090", "http://localhost:9090"})
@RequestMapping("/biz/csh") // API 기본 경로
@Transactional
public class CshController {

    private final CshService cshService;

    public CshController(CshService cshService) {
        this.cshService = cshService;
    }

    @PostMapping("/updatResume")
    public ResponseEntity<?> updateResume(@RequestBody Map<String, Object> requestData) {
        System.out.println( requestData);

        return cshService.updateResume(requestData);
    }



}
