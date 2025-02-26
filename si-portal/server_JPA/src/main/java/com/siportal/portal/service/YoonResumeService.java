package com.siportal.portal.service;

import com.siportal.portal.controller.biz.YoonResumeController;
import com.siportal.portal.dto.YoonResumeListProjection;
import com.siportal.portal.dto.YoonResumeListResponse;
import com.siportal.portal.repository.YoonResumeRepository;

import org.springframework.stereotype.Service;

import java.util.List;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class YoonResumeService {

  private final YoonResumeRepository yoonResumeRepository;

  public List<YoonResumeListProjection> getResumeList(){
      return yoonResumeRepository.findAllBy();
  }



}
