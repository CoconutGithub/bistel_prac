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

    //기간 조회(강관)
    public List<PipeYieldLot> getPipeYieldLotsByWorkDate(String startDate, String endDate) {
        return pipeRepository.findAllByWorkDateBetweenOrderByWorkDateDesc(startDate, endDate);
    }

    // 강봉 이상 LOT 조회
    public List<BarYieldLot> getBarYieldLots() {
        return barRepository.findAll();
    }

    //기간 조회(강봉)
    public List<BarYieldLot> getBarYieldLotsByWorkDate(String startDate, String endDate) {
        return barRepository.findAllByWorkDateBetweenOrderByWorkDateDesc(startDate, endDate);
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

    // [NEW] 동적 쿼리 검색 (챗봇 연동용) -> 유지 (구버전 호환)
    public List<?> searchYield(com.siportal.portal.dto.YieldQueryDTO request) {
        if ("bar".equalsIgnoreCase(request.getProduct_type())) {
            return barRepository.findByDynamicCondition(
                    request.getStart_date(), request.getEnd_date(),
                    request.getMin_yield(), request.getMax_yield()
            );
        } else if ("pipe".equalsIgnoreCase(request.getProduct_type())) {
            return pipeRepository.findByDynamicCondition(
                    request.getStart_date(), request.getEnd_date(),
                    request.getMin_yield(), request.getMax_yield()
            );
        } else {
            throw new IllegalArgumentException("Unknown product_type: " + request.getProduct_type());
        }
    }

    // [SPECIALIZED 1] 강봉 고수율 검색
    public List<BarYieldLot> findHighYieldBars(Double minYield) {
        return barRepository.findHighYield(minYield != null ? minYield : 70.0);
    }

    // [SPECIALIZED 1-2] 강봉 저수율 검색
    public List<BarYieldLot> findLowYieldBars(Double maxYield) {
        return barRepository.findLowYield(maxYield != null ? maxYield : 70.0);
    }

    // [SPECIALIZED 2] 강관 저수율 검색
    public List<PipeYieldLot> findLowYieldPipes(String startDate, String endDate, Double maxYield) {
        // 날짜 기본값 처리 등은 Controller나 여기서 수행
        return pipeRepository.findLowYield(startDate, endDate, maxYield != null ? maxYield : 70.0);
    }

    // [SPECIALIZED 2-2] 강관 고수율 검색
    public List<PipeYieldLot> findHighYieldPipes(String startDate, String endDate, Double minYield) {
        return pipeRepository.findHighYield(startDate, endDate, minYield != null ? minYield : 70.0);
    }

    // [SPECIALIZED 3] 과잉 생산 검색
    public List<?> findExcessProduction(String productType) {
        if ("bar".equalsIgnoreCase(productType)) {
            return barRepository.findExcess();
        } else if ("pipe".equalsIgnoreCase(productType)) {
            return pipeRepository.findExcess();
        } else {
            throw new IllegalArgumentException("Unknown product_type for excess query: " + productType);
        }
    }
}