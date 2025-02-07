package com.siportal.portal.mapper;

import com.siportal.portal.dto.FileRequest;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FileMapper {
    void insertFiles(
                    @Param("files") List<FileRequest> files
                    );
}
