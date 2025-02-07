package com.siportal.portal.service;

import com.siportal.portal.domain.File;
import com.siportal.portal.dto.FileRequest;
import com.siportal.portal.mapper.FileMapper;
import com.siportal.portal.repository.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class FileService {

    @Autowired
    private FileRepository fileRepository;

    @Transactional
    public void saveFiles(Long fileGroupId, List<FileRequest> files) {
        if (files == null || files.isEmpty()) {
            return;
        }

        for (FileRequest fileRequest : files) {
            File file = new File();
            file.setFileGroupId(fileGroupId);
            file.setFileName(fileRequest.getFileName());
            file.setFilePath(fileRequest.getFilePath());
            file.setFileSize(fileRequest.getFileSize());
            file.setCreatedBy("system");
            file.setUpdatedBy("system");

            fileRepository.save(file);
        }
    }

//    Mybatis 방식
//    @Autowired
//    private FileMapper fileMapper;
//
//    @Transactional
//    public void saveFiles(Long fileGroupId, List<FileRequest> files) {
//        if (files != null && !files.isEmpty()) {
//            for (FileRequest file : files) {
//                file.setFileGroupId(fileGroupId);
//                file.setCreatedBy("system");
//                file.setUpdatedBy("system");
//            }
//
//            fileMapper.insertFiles(files);
//        }
//    }
}
