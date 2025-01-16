package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminMapper {
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);
    List<ComResultMap> getEmailHistory(@Param("sendUser") String sendUser);

    int updateUser(Map<String, Object> user);
    int updateUserRole(Map<String, Object> user);

    int deleteUser(@Param("userId") String userId);
    int deleteUserRole(@Param("userId") String userId);



    void deleteUserInfo(@Param("userId") String userId);
}
