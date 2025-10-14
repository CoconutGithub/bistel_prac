package com.siportal.portal.service;

import com.siportal.portal.dto.InformationDTO;
import com.siportal.portal.domain.Information;
import java.util.List;

public interface InformationService {
    List<Information> getInformation();
    Information createInformation(InformationDTO informationDTO);
    Information updateInformation(Integer id,InformationDTO informationDTO);
    void deleteInformation(Integer id);
}
