package com.siportal.portal.controller.biz;

import com.siportal.portal.service.TrainAbilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/train-ability")
@RequiredArgsConstructor
public class TrainAbilityController {

    private final TrainAbilityService trainAbilityService;

    @GetMapping("/ability-unit")
    public ResponseEntity<?> getAllAbilityUnit(){
        System.out.println("getAllAbilityUnit");
        return trainAbilityService.allAbilityUnit();
    }

    @GetMapping("/basic-competency")
    public ResponseEntity<?> getAllBasicCompetency(){
        System.out.println("getAllBasicCompetency");
        return trainAbilityService.allBasicCompetency();
    }
}
