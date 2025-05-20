package com.siportal.portal.controller;

import com.siportal.portal.domain.Language;
import com.siportal.portal.domain.User;
import com.siportal.portal.repository.LanguageRepository;
import com.siportal.portal.repository.UserRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/language")
public class LanguageController {

    @Autowired
    private LanguageRepository langRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/list")
    public List<Language> getLanguages() {
        return langRepo.findAllByOrderByLangOrderAsc();
    }

    @PostMapping("/set-lang")
    public ResponseEntity<?> setUserLang(@RequestBody SetLangRequest req) {
        Integer userId = Integer.parseInt(req.getUserId());  // ← 여기 추가

        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자 없음");
        }

        User user = userOpt.get();
        user.setLangCode(req.getLangCode());
        userRepo.save(user);

        return ResponseEntity.ok("OK");
    }

    @Getter @Setter
    public static class SetLangRequest {
        private String userId;
        private String langCode;
    }
}
