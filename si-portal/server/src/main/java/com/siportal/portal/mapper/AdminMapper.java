package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);
    List<ComResultMap> getEmailHistory(@Param("sendUser") String sendUser);
}
