package com.siportal.portal.repository;

import com.siportal.portal.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {

    void deleteByUserId(String userId);
}
