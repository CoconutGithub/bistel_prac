package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.PMenuDTO;
import com.siportal.portal.dto.SchedulDTO;
import com.siportal.portal.dto.User;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface PortalMapper {
    User getUserByUserId(@Param("userId") String userPassword, @Param("password") String password);
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);
    List<PMenuDTO> getMenuTreeList(@Param("roleId") String roleId);

    void updateUserSettings(@Param("userId") String userId,
                            @Param("footerYn") String footerYn,
                            @Param("headerColor") String headerColor);

    @MapKey("role_id")
    List<Map<String, Object>> getAllRole();

    @MapKey("userId")
    Map<String, Object> getUserSettings(@Param("userId") String userId);

}
