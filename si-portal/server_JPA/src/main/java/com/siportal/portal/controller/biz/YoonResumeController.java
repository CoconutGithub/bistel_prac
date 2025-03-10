package com.siportal.portal.controller.biz;

import com.siportal.portal.dto.YoonResumeListResponse;
import com.siportal.portal.dto.YoonResumeResponse;
import com.siportal.portal.service.YoonResumeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/biz/yoon-resume")
public class YoonResumeController {

  private final YoonResumeService yoonResumeService;

//  //create
//  @PostMapping
////  public ResponseEntity<YoonResumeResponse> createResume(){
////
////  }
//
//
//
//  //update
//    //license, 자격증, 교육, skill 개별 삭제
//
//    //내용 수정 <- 자격증, 교육, skill 같은 것들 어떻게 할까나? 잘 모르니까 전체 수정부터 구현
//
//  //read
  @GetMapping
  public ResponseEntity<List<YoonResumeListResponse>> readResumeList(){
      List<YoonResumeListResponse> response= yoonResumeService.getResumeList()
                     .stream()
                     .map(YoonResumeListResponse::new)
                     .toList();

    return ResponseEntity.ok().body(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<YoonResumeResponse> readResume(@PathVariable int id){
      YoonResumeResponse response=yoonResumeService.getResume(id).get();

      return ResponseEntity.ok().body(response);
  }


  //delete
    //이력서 삭제


}
