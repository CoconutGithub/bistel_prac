package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.PMenuDTO;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PortalMapper {
    List<ComResultMap> getPageAuth(@Param("roleId") String roleId, @Param("path") String path);
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);
    List<PMenuDTO> getMyMenuTreeList(@Param("roleId") String roleId);
    List<PMenuDTO> getAllMenuTreeList();

    void updateUserSettings(@Param("userId") String userId,
                            @Param("footerYn") String footerYn,
                            @Param("headerColor") String headerColor);


    @MapKey("role_id")
    List<Map<String, Object>> getAllRole();

    @MapKey("userId")
    Map<String, Object> getUserSettings(@Param("userId") String userId);

}
