package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.SchedulDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminMapper {

    List<ComResultMap> getMenuTree();

    List<ComResultMap> getUserByUserName(@Param("userName") String userName);
    List<ComResultMap> getEmailHistory(@Param("sendUser") String sendUser);

    int updateUser(Map<String, Object> user);
    int updateUserRole(Map<String, Object> user);

    int deleteUser(@Param("userId") String userId);
    int deleteUserRole(@Param("userId") String userId);

    List<ComResultMap> getAllRoles(@Param("roleName") String roleName);
    List<ComResultMap> getRoleList();

    int updatePermission(Map<String, Object> permission);
    int deletePermission(@Param("permissionId") Integer permissionId);

    void updateRole(ComResultMap role);

    void insertRole(ComResultMap role);

    void deleteRole(@Param("roleId") String roleId);

    void deleteUserInfo(@Param("userId") String userId);

    List<SchedulDTO> getScheduleList(@Param("jobName") String jobName, @Param("status") String status);

    void deleteSchedule(@Param("jobName") String jobName, @Param("groupName") String groupName);
}
