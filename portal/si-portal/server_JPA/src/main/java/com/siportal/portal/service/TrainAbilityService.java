package com.siportal.portal.service;

import com.siportal.portal.domain.AbilityUnit;
import com.siportal.portal.domain.BasicCompetency;
import com.siportal.portal.mapper.AbilityUnitMapper;
import com.siportal.portal.mapper.BasicCompetencyMapper;
import com.siportal.portal.repository.AbilityUnitRepository;
import com.siportal.portal.repository.BasicCompetencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TrainAbilityService {
//    private final AbilityUnitRepository abilityUnitRepository;
//    private final BasicCompetencyRepository basicCompetencyRepository;

    private final AbilityUnitMapper abilityUnitMapper;
    private final BasicCompetencyMapper basicCompetencyMapper;

    public ResponseEntity<?> allAbilityUnit(){
        return ResponseEntity.ok(abilityUnitMapper.getAbilityUnit());
//        return ResponseEntity.ok().body(abilityUnitRepository.findAll());
    }
    public ResponseEntity<?> allBasicCompetency(){
        return ResponseEntity.ok(basicCompetencyMapper.getBasicCompetency());
//        return ResponseEntity.ok().body(basicCompetencyRepository.findAll());
    }
}
