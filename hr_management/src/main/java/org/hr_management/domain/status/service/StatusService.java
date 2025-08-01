package org.hr_management.domain.status.service;

import lombok.RequiredArgsConstructor;
import org.hr_management.domain.status.db.StatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class StatusService {

    private final StatusRepository statusRepository;

    public List<String> getStatusCodes(String type) {
        return statusRepository.findAllByType(type);
    }

}
