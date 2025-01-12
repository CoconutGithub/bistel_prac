package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.PMenuDTO;
import com.siportal.portal.dto.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PortalMapper {
    User getUserByUserId(@Param("userId") String userPassword, @Param("password") String password);
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);
    List<PMenuDTO> getMenuTreeList();
}
