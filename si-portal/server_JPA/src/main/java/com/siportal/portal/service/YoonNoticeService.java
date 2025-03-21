package com.siportal.portal.service;

import com.siportal.portal.domain.Notice;
import com.siportal.portal.domain.User;
import com.siportal.portal.dto.AddNoticeRequest;
import com.siportal.portal.dto.YoonNoticeDto;
import com.siportal.portal.dto.YoonUpdateNoticeRequest;
import com.siportal.portal.repository.NoticeRepository;
import com.siportal.portal.repository.YoonNoticeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.swing.text.html.Option;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class YoonNoticeService {
  private final YoonNoticeRepository yoonNoticeRepository;
  private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

//  public Notice save(AddNoticeRequest request){
//
//  }

  public List<YoonNoticeDto> findNoticeList(){
    List<YoonNoticeDto> result=yoonNoticeRepository.findAllBy().stream().map(YoonNoticeDto::new).toList();
    System.out.println("notice 리스트: "+ result);


    return result;

  }

  @Transactional
  public void updateNotice(@RequestBody Map<String,Object> request){
      //데이터 파싱
      List<Map<String,Object>> deleteList =(List<Map<String,Object>>) request.get("deleteList");
      List<Map<String,Object>> updateList =(List<Map<String,Object>>) request.get("updateList");


      //삭제 처리

      List<Long> ids = deleteList.stream()
                .map(map -> ((Number)map.get("id")).longValue())
                .collect(Collectors.toList()); //stream 쓰는 법 알면 코딩이 너무 재밌을듯 ㄷㄷ <- 조만간 iterater와 stream을 모두 이용해서 구현해보자!

//      List<Long> ids= request.stream()
//                             .map(YoonNoticeDto::getId)
//                             .collect(Collectors.toList());
      Iterator<Long> it=ids.iterator();
      while(it.hasNext()){
        System.out.println("id 출력:" + it.next());
      }

      yoonNoticeRepository.deleteAllByIdInBatch(ids);//이렇게 아무것도 리턴을 안 했던가? ㅇㅇ


    //update 처리 <- 이걸 하려면 optional도 공부할 필요가 있긴 한데..

    //1. 조회

    //2. 수정
    for (Map<String, Object> notice : updateList) {
      System.out.println("수정 notice: "+notice);

      System.out.println("수정 noticStart: "+(String)notice.get("noticeStart"));





      Notice noticeObj = yoonNoticeRepository.findById(((Number)notice.get("id")).longValue())
                                   .orElseThrow(() -> new RuntimeException("Notice not found"));


      noticeObj.setContent((String)notice.get("content"));
      noticeObj.setTitle((String)notice.get("title"));

      String noticeStart=(String)notice.get("noticeStart");
      //noticeStart=noticeStart.replaceAll("\\.\\d+","");


      System.out.println("아오 noticeStart: "+noticeStart);
      noticeObj.setNoticeStart(LocalDateTime.parse(noticeStart,formatter));//이건 저장이 안 되었다.
//      noticeObj.setNoticeStart(LocalDateTime.parse((String)notice.get("noticeEnd"),formatter));
      ;

      //formatter.parse()

      ;
      //noticeObj.setTitle((String) );

      //title, content, Notice Start, Notice End 등등만 수정하자

//      noticeObj.setUserName((String)user.get("userName"));
//      noticeObj.setPhoneNumber((String)user.get("phoneNumber"));
//      noticeObj.setStatus((String)user.get("status"));
//      noticeObj.setEmail((String)user.get("email"));
//      noticeObj.setUpdateBy("system");
//      noticeObj.setUpdateDate(LocalDateTime.now());


    }





  }

//  public void updateNotice(Long id, YoonUpdateNoticeRequest yoonUpdateNoticeRequest){
//    yoonNoticeRepository.
//  }

}
