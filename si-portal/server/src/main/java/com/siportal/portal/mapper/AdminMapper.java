package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.dto.SchedulDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AdminMapper {
    int getMenuId();
    int createMenu(@Param("menuId") int menuId, @Param("menuName") String menuName, @Param("menuUrl") String menuUrl,  @Param("menuParent") int menuParent);
    int deleteMenu(@Param("menuId") int menuId);
    List<ComResultMap> getMenuTree();

    List<ComResultMap> getUserByUserName(@Param("userName") String userName);
    List<ComResultMap> getEmailHistory(@Param("sendUser") String sendUser);

    int existUser(@Param("userId") String userId);
    void registerUser(Map<String, Object> user);
    void updateProfileImage(Map<String, Object> user);
    Map<String, Object> getUserProfileImage(String userId);
    void updatePhoneNumber(Map<String, Object> user);
    Map<String, Object> getUserPhoneNumber(@Param("userId") String userId);
    void updateUserPassword(Map<String, Object> user);
    void registerUserRole(Map<String, Object> userRoleObject);
    List<Map<String, Object>> getMenuIdSeq();
    void insertMenu(Map<String, Object> data);
    void deleteMenu(Map<String, Object> data);

    void updateMenuContent(Map<String, Object> data);

    int updateUser(Map<String, Object> user);
    int updateUserRole(Map<String, Object> user);

    int deleteUser(@Param("userId") String userId);
    int deleteUserRole(@Param("userId") String userId);

    int createMenuRole(Map<String, Object> user);
    int updateMenuRole(Map<String, Object> user);
    int deleteMenuRole(Map<String, Object> user);


    List<ComResultMap> getAllRoles(@Param("roleName") String roleName);
    List<ComResultMap> getRoleList();
    List<ComResultMap> getMenuRole(@Param("menuId") Integer menuIdStr);

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
