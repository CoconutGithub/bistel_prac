package org.hr_management.domain.filter.controller;

import jakarta.servlet.Filter;
import lombok.RequiredArgsConstructor;
import org.hr_management.domain.filter.db.UserFilterEntity;
import org.hr_management.domain.filter.dto.FilterDto;
import org.hr_management.domain.filter.service.FilterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/filter")
public class FilterController {
    private final FilterService filterService;

    @PostMapping("/set")
    public ResponseEntity<?> setFilter(@RequestBody FilterDto filterDto){
        return filterService.setUserFilter(filterDto);

    }

    @GetMapping("/get/{table}")
    public List<UserFilterEntity> getFilter(@PathVariable("table") String tableName) {
        Integer empId = (Integer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("empId:"+empId);

        return filterService.getUserFilter(empId, tableName);
    }

}
