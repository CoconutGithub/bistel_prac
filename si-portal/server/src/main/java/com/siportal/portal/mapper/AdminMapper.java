package com.siportal.portal.mapper;

import com.siportal.portal.com.result.ComResultMap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AdminMapper {

    // 사용자 이름으로 사용자 조회
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);

    // 모든 역할 조회
    List<ComResultMap> getAllRoles();

    // 역할 업데이트
    void updateRole(ComResultMap role);

    // 역할 삽입
    void insertRole(ComResultMap role);

    // 역할 삭제
    void deleteRole(@Param("roleId") String roleId);
}
