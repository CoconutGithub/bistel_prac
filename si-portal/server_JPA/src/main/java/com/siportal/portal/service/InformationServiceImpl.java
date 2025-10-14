package com.siportal.portal.service;

import com.siportal.portal.domain.Information;
import com.siportal.portal.dto.InformationDTO;
import com.siportal.portal.repository.InformationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InformationServiceImpl implements InformationService {
    private final InformationRepository informationRepository;

    @Autowired
    public InformationServiceImpl(InformationRepository informationRepository) {
        this.informationRepository = informationRepository;
    }

    @Override
    @Transactional
    public Information createInformation(InformationDTO informationDTO) {
        Information information = new Information();
        information.setTitle(informationDTO.getTitle());
        information.setDescription(informationDTO.getDescription());
        information.setContents(informationDTO.getContents());
        return informationRepository.save(information);
    }

    @Override
    @Transactional
    public List<Information> getInformation() { return informationRepository.findAll(); }


    @Override
    @Transactional
    public Information updateInformation(Integer id, InformationDTO informationDTO) {
        Optional<Information> optionalInformation = informationRepository.findById(id);
        if(optionalInformation.isPresent()) {
            Information information = optionalInformation.get();
            information.setTitle(informationDTO.getTitle());
            information.setDescription(informationDTO.getDescription());
            information.setContents(informationDTO.getContents());
            return informationRepository.save(information);
        } else {
            return null;
        }
    }

    @Override
    @Transactional
    public void deleteInformation(Integer id) { informationRepository.deleteById(id); }


}
