package com.siportal.portal.service;

import com.siportal.portal.com.error.ErrorCode;
import com.siportal.portal.com.exception.ApiException;
import com.siportal.portal.domain.AccountNameCategory;
import com.siportal.portal.domain.CorporateCardTransaction;
import com.siportal.portal.dto.AccountNameCategoryDto;
import com.siportal.portal.dto.CorporateCardTransactionDto;
import com.siportal.portal.dto.cct.CctPatchRequest;
import com.siportal.portal.repository.AccountNameCategoryRepository;
import com.siportal.portal.repository.CorporateCardTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CorporateCardTransactionService {

    private final CorporateCardTransactionRepository corporateCardTransactionRepository;
    private final AccountNameCategoryRepository accountNameCategoryRepository;
    private final MinioService minioService;

    public List<CorporateCardTransactionDto> getCorporateCardTransactionBetweenDates(
            String userId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1L).atStartOfDay().minusNanos(1L);

        log.info("date convert to datetime log debug: {}, {}", startDateTime, endDateTime);

        List<CorporateCardTransaction> entities = corporateCardTransactionRepository.findByApprovalDateBetweenStartDateAndEndDate(
                userId, startDateTime, endDateTime
        );

        List<CorporateCardTransactionDto> dtos = entities.stream().map(entity -> {
            return CorporateCardTransactionDto.builder()
                    .id(entity.getId())
                    .status(entity.getStatus())
                    .approvalNumber(entity.getApprovalNumber())
                    .approvalDate(entity.getApprovalDate())
                    .cardType(entity.getCardType())
                    .isCancelled(entity.getIsCancelled())
                    .merchantName(entity.getMerchantName())
                    .merchantCategory(entity.getMerchantCategory())
                    .transactionAmount(entity.getTransactionAmount())
                    .splitCount(entity.getSplitCount())
                    .supplyAmount(entity.getSupplyAmount())
                    .taxAmount(entity.getTaxAmount())
                    .accountName(entity.getAccountName())
                    .projectCode(entity.getProjectCode())
                    .projectName(entity.getProjectName())
                    .description(entity.getDescription())
                    .transactionDate(entity.getTransactionDate())
                    .fileName(entity.getFileName())
                    .filePath(entity.getFilePath())
                    .attachRejectionReason(entity.getAttachRejectionReason())
                    .preApprovalFileName(entity.getPreApprovalFileName())
                    .preApprovalFilePath(entity.getPreApprovalFilePath())
                    .userId(entity.getUserId())
                    .merchantOwnerName(entity.getMerchantOwnerName())
                    .merchantAddress(entity.getMerchantAddress())
                    .cardCompany(entity.getCardCompany())
                    .cardNumber(entity.getCardNumber())
                    .businessRegistrationNumber(entity.getBusinessRegistrationNumber())
                    .build();
        }).toList();

        return dtos;
    }

    public List<AccountNameCategoryDto> getAccountNames() {
        List<AccountNameCategory> entities = accountNameCategoryRepository.findAllByOrderByLevelDesc();
        if(entities.isEmpty()) {
            throw new RuntimeException("no account name list");
        }

        Map<Integer, AccountNameCategoryDto> dtoMap = entities.stream()
                .collect(Collectors.toMap(
                        AccountNameCategory::getCategoryId,
                        e -> AccountNameCategoryDto.builder()
                                .categoryId(e.getCategoryId())
                                .categoryName(e.getCategoryName())
                                .categoryCode(e.getCategoryCode())
                                .parentId(e.getParentId())
                                .level(e.getLevel())
                                .children(new ArrayList<>())
                                .build()
                ));

        List<AccountNameCategoryDto> roots = new ArrayList<>();

        for(AccountNameCategoryDto dto:  dtoMap.values()) {
            if(dto.getParentId() == null) {
                roots.add(dto);
            }else{
                AccountNameCategoryDto parent = dtoMap.get(dto.getParentId());
                if (parent != null) {
                    parent.getChildren().add(dto);
                }
            }
        }

        return roots;
    }

    public Boolean isCctOwner(String userId, Integer cctId) {
        corporateCardTransactionRepository.findByIdAndUserId(cctId, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.AUTH_ERROR, "접근 권한이 없습니다."));

        return true;
    }

    public Boolean isCctsOwner(String userId, List<Integer> cctIds) {
        int cctListSize = corporateCardTransactionRepository.findAllByIdInAndUserId(cctIds, userId).size();
        if(cctListSize != cctIds.size()) {
            throw new ApiException(ErrorCode.AUTH_ERROR, "카드 내역 수정 권한이 없습니다.");
        }

        return true;
    }

    @Transactional
    public void patchCcts(String userId, List<CctPatchRequest> requests) {
        List<Integer> cctIds = requests.stream().map(CctPatchRequest::getCctId).toList();
        List<CorporateCardTransaction> entities = corporateCardTransactionRepository.findAllByIdInAndUserId(cctIds, userId);

        if(entities.size() != cctIds.size()) {
            throw new ApiException(ErrorCode.AUTH_ERROR, "카드 내역 수정 권한이 없습니다.");
        }

        Map<Integer, CorporateCardTransaction> entityMap = entities.stream()
                .collect(Collectors.toMap(CorporateCardTransaction::getId, entity -> entity));

        requests.forEach(request -> {
            CorporateCardTransaction entity = entityMap.get(request.getCctId());

            if (entity == null) {
                throw new ApiException(ErrorCode.NOT_FOUND, "수정할 카드 내역을 찾을 수 없습니다. 다시 시도해주세요.");
            }

            if (request.getAccountName() != null) {
                entity.setAccountName(request.getAccountName());
            }
            if (request.getProjectCode() != null) {
                entity.setProjectCode(request.getProjectCode());
            }
            if (request.getProjectName() != null) {
                entity.setProjectName(request.getProjectName());
            }
            if (request.getDescription() != null) {
                entity.setDescription(request.getDescription());
            }
        });
    }
}
