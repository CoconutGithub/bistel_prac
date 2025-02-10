package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.MenuDto;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PortalMapper {
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);

    void updateUserSettings(@Param("userId") String userId,
                            @Param("footerYn") String footerYn,
                            @Param("headerColor") String headerColor);

    @MapKey("userId")
    Map<String, Object> getUserSettings(@Param("userId") String userId);

}
