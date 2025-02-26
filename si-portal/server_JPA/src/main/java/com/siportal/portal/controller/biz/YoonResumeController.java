package com.siportal.portal.controller.biz;

import com.siportal.portal.dto.YoonResumeListResponse;
import com.siportal.portal.service.YoonResumeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

  //create



  //update


  //read
  @GetMapping
  public ResponseEntity<List<YoonResumeListResponse>> readResumeList(){
    List<YoonResumeListResponse> response= yoonResumeService.getResumeList()
                     .stream()
                     .map(YoonResumeListResponse::new)
                     .toList();

    return ResponseEntity.ok().body(response);
  }


  //delete

}
