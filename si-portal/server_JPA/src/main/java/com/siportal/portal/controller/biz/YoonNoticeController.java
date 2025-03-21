package com.siportal.portal.controller.biz;

import com.siportal.portal.domain.Notice;
import com.siportal.portal.dto.NoticeDto;
import com.siportal.portal.dto.YoonNoticeDto;
import com.siportal.portal.dto.YoonUpdateNoticeRequest;
import com.siportal.portal.service.YoonNoticeService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.http.HttpRequest;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
//@RequestMapping("biz/yoon-notice")//
@RestController//
public class YoonNoticeController {
  private final YoonNoticeService yoonNoticeService;

  @GetMapping("biz/yoon-notice")
  public ResponseEntity<List<YoonNoticeDto>> getNoticeList(){
    return ResponseEntity.ok().body(yoonNoticeService.findNoticeList());
  }

  @PostMapping("biz/yoon-notice")
  public ResponseEntity<Void> updateNotice(@RequestBody Map<String,Object> request){
//  System.out.print("id입니다!!!!: "+id);
    yoonNoticeService.updateNotice(request);
    return ResponseEntity.ok().build();
  }

//  @PutMapping("biz/yoon-notice/{id}")
//  public ResponseEntity<Notice> updateNotice(@PathVariable Long id,
//                                             @RequestBody YoonUpdateNoticeRequest yoonUpdateNoticeRequest){
//
//  }


}
