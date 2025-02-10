package com.siportal.portal.controller.biz;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/biz") // API 기본 경로
@Transactional
public class ChoBiz {

}
