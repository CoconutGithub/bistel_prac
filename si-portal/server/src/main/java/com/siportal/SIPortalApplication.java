package com.siportal;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan(basePackages = {
	"com.siportal.portal.mapper",
})
public class SIPortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(SIPortalApplication.class, args);
	}

}
