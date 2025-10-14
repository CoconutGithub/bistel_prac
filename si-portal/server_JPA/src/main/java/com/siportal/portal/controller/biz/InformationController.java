package com.siportal.portal.controller.biz;

import com.siportal.portal.domain.Information;
import com.siportal.portal.dto.InformationDTO;
import com.siportal.portal.service.InformationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/biz/information")
public class InformationController {
    private final InformationService informationService;

    @Autowired
    public InformationController(InformationService informationService) { this.informationService = informationService; }

    @PostMapping
    public ResponseEntity<Information> createInformation(@RequestBody InformationDTO informationDTO) {
        return ResponseEntity.ok(informationService.createInformation(informationDTO));
    }

    @GetMapping
    public ResponseEntity<List<Information>> getAllInformation() {
        return ResponseEntity.ok(informationService.getInformation());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Information> updateInformation(@PathVariable Integer id, @RequestBody InformationDTO informationDTO) {
        Information updatedInformation = informationService.updateInformation(id, informationDTO);
        return updatedInformation != null ? ResponseEntity.ok(updatedInformation) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Information> deleteInformation(@PathVariable Integer id) {
        informationService.deleteInformation(id);
        return ResponseEntity.noContent().build();
    }
}
