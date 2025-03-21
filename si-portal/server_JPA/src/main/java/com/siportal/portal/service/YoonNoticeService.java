package com.siportal.portal.service;

import com.siportal.portal.domain.Notice;
import com.siportal.portal.domain.User;
import com.siportal.portal.dto.AddNoticeRequest;
import com.siportal.portal.dto.YoonNoticeDto;
import com.siportal.portal.dto.YoonUpdateNoticeRequest;
import com.siportal.portal.repository.NoticeRepository;
import com.siportal.portal.repository.YoonNoticeRepository;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

import javax.swing.text.html.Option;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class YoonNoticeService {
  private final YoonNoticeRepository yoonNoticeRepository;
  private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

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

      Iterator<Long> it=ids.iterator();
      while(it.hasNext()){
        System.out.println("id 출력:" + it.next());
      }
      yoonNoticeRepository.deleteAllByIdInBatch(ids);


    //update 처리 <- 이걸 하려면 optional도 공부할 필요가 있긴 한데..
    for (Map<String, Object> notice : updateList) {
//      System.out.println("수정 notice: "+notice);
//      System.out.println("수정 noticStart: "+(String)notice.get("noticeStart"));

      //1. 조회
      Notice noticeObj = yoonNoticeRepository.findById(((Number)notice.get("id")).longValue())
                                   .orElseThrow(() -> new RuntimeException("Notice not found"));


      //2. 수정
      noticeObj.setContent((String)notice.get("content"));
      noticeObj.setTitle((String)notice.get("title"));

      String noticeStart=(String)notice.get("noticeStart");
      //noticeStart=noticeStart.replaceAll("\\.\\d+","");
      System.out.println("아오 noticeStart: "+noticeStart);
      noticeObj.setNoticeStart(LocalDateTime.parse(noticeStart,formatter));//이건 저장이 안 되었다.

      noticeObj.setNoticeStart(LocalDateTime.parse((String)notice.get("noticeEnd"),formatter));

    }
  }

  public void createExcelFile(Long id){

    //Blank workblook
    XSSFWorkbook workbook = new XSSFWorkbook();

    //Create a blank sheet

    XSSFSheet sheet = workbook.createSheet("Employee Data");

    //Prepare data to be written as an object;

    List<YoonNoticeDto> yoonNoticeDtos=  yoonNoticeRepository.findAllBy()
                                                            .stream()
                                                            .map(YoonNoticeDto::new)
                                                            .toList();



//    Map<String, Object[]> data = new TreeMap<String,Object[]>();//객체 배열? 나니?
//    data.put("1", new Object[] {"ID", "NAME", "LASTNAME"}); //<- String은 객체이니까
//    data.put("2", new Object[] {1, "Amit", "Shukla"});
//    data.put("3", new Object[] {2, "Lokesh", "Gupta"});
//    data.put("4", new Object[] {3, "John", "Adwards"});
//    data.put("5", new Object[] {4, "Brian", "Schultz"});

        //익명 객체가 있나보다 ㅅㅂ <- 객체 배열 못 알아보는거보면 java 공부 해야할 듯 ㅅㅂ

//    Set<String> keyset = data.keySet();
    int rownum = 0;
    int cellnum = 0;
    Row row;

//    for (String key : keyset) {
    //sheet.createRow(1).createCell(1)

    List<String> columnName= new ArrayList<String>(Arrays.asList("id", "title", "content", "notice_start", "notice_end", "created_at", "updated_at"));

    row = sheet.createRow(rownum++);
    for(String col: columnName){
      Cell cell = row.createCell(cellnum++);
      cell.setCellValue(col);
    }



    for(YoonNoticeDto yoonNoticeDto : yoonNoticeDtos){

      row = sheet.createRow(rownum++);
      //Object [] objArr = data.get(key);
      cellnum = 0;
      //for (Object obj : objArr)
      //{

      Cell cell = row.createCell(cellnum++);
      cell.setCellValue(rownum);

      cell = row.createCell(cellnum++);
      cell.setCellValue(yoonNoticeDto.getTitle());

      cell = row.createCell(cellnum++);
      cell.setCellValue(yoonNoticeDto.getContent());

      cell = row.createCell(cellnum++);
      cell.setCellValue(yoonNoticeDto.getNoticeStart());

      cell = row.createCell(cellnum++);
      cell.setCellValue(yoonNoticeDto.getNoticeEnd());

      cell = row.createCell(cellnum++);
      cell.setCellValue(yoonNoticeDto.getCreatedAt());

      cell = row.createCell(cellnum++);
      cell.setCellValue(yoonNoticeDto.getUpdatedAt());

//      if(obj instanceof String)
//        cell.setCellValue((String)obj);
//      else if(obj instanceof Integer)
//        cell.setCellValue((Integer)obj);
      //}
    }

    //Write the workbook in file system

    try {
      FileOutputStream out = new FileOutputStream(new File("howtodoinjava_demo1.xlsx"));
      workbook.write(out);
      out.close();
      System.out.println("howtodoinjava_demo.xlsx written successfully on disk.");
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }
}
