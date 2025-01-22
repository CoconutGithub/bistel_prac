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

    List<Map<String, Object>> getMenuIdSeq();
    void insertMenu(Map<String, Object> data);
    void deleteMenu(Map<String, Object> data);

    void updateMenuContent(Map<String, Object> data);

    int updateUser(Map<String, Object> user);
    int updateUserRole(Map<String, Object> user);

    int deleteUser(@Param("userId") String userId);
    int deleteUserRole(@Param("userId") String userId);

    List<ComResultMap> getAllRoles(@Param("roleName") String roleName);
    List<ComResultMap> getRoleList();

    int insertRole(Map<String, Object> role); // 수정: ComResultMap 대신 Map<String, Object> 사용

    int updateRole(Map<String, Object> role);

    int deleteRoles(@Param("list") List<Integer> roleIds);

    void deleteUserInfo(@Param("userId") String userId);

    List<SchedulDTO> getScheduleList(@Param("jobName") String jobName, @Param("status") String status);

    int deleteSchedule(@Param("jobName") String jobName, @Param("groupName") String groupName);
    int createSchedule(@Param("jobName") String jobName, @Param("groupName") String groupName, @Param("triggerKey") String triggerKey
            , @Param("className") String className, @Param("cronTab") String cronTab, @Param("status") String status, @Param("userId") String createBy);
    int updateSchedule(@Param("jobName") String jobName, @Param("groupName") String groupName, @Param("triggerKey") String triggerKey
            , @Param("className") String className, @Param("cronTab") String cronTab, @Param("status") String status, @Param("userId") String createBy);
}
