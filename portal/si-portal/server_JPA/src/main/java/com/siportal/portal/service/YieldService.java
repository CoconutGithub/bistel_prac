package com.siportal.portal.service;

import com.siportal.portal.domain.BarYieldLot;
import com.siportal.portal.domain.PipeYieldLot;
import com.siportal.portal.domain.YieldHistory;
import com.siportal.portal.dto.ItemCriteriaDTO;
import com.siportal.portal.repository.BarYieldLotRepository;
import com.siportal.portal.repository.PipeYieldLotRepository;
import com.siportal.portal.repository.YieldHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class YieldService {

    private final PipeYieldLotRepository pipeRepository;
    private final BarYieldLotRepository barRepository;
    private final YieldHistoryRepository historyRepository;

    // 강관 이상 LOT 조회
    public List<PipeYieldLot> getPipeYieldLots() {
        return pipeRepository.findAll();
    }

    // 강봉 이상 LOT 조회
    public List<BarYieldLot> getBarYieldLots() {
        return barRepository.findAll();
    }

    // 9가지 조건에 따른 수율 이력 조회 (트렌드 차트용)
    public List<YieldHistory> getYieldHistoryByCriteria(ItemCriteriaDTO criteria) {
        return historyRepository.findHistoryByItemCriteria(
                criteria.getItemType(),
                criteria.getSteelGradeL(),
                criteria.getSteelGradeGroup(),
                criteria.getShape(),
                criteria.getInhouseSteelName(),
                criteria.getOrderHeatTreat(),
                criteria.getMaterialL(),
                criteria.getSurface(),
                criteria.getOrderOuterDia()
        );
    }
}