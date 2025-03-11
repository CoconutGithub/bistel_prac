package com.siportal.portal.service;

import com.siportal.portal.domain.Notice;
import com.siportal.portal.dto.AddNoticeRequest;
import com.siportal.portal.dto.YoonNoticeDto;
import com.siportal.portal.dto.YoonUpdateNoticeRequest;
import com.siportal.portal.repository.NoticeRepository;
import com.siportal.portal.repository.YoonNoticeRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import javax.swing.text.html.Option;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class YoonNoticeService {
  private final YoonNoticeRepository yoonNoticeRepository;

//  public Notice save(AddNoticeRequest request){
//
//  }

  public List<YoonNoticeDto> findNoticeList(){
       return yoonNoticeRepository.findAllBy().stream().map(YoonNoticeDto::new).toList();
  }

  public void deleteNotice(Long id){
      yoonNoticeRepository.deleteById(id);//이렇게 아무것도 리턴을 안 했던가? ㅇㅇ
  }

//  public void updateNotice(Long id, YoonUpdateNoticeRequest yoonUpdateNoticeRequest){
//    yoonNoticeRepository.
//  }

}
