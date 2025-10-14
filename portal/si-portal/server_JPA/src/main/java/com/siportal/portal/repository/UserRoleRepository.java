package com.siportal.portal.repository;

import com.siportal.portal.domain.User;
import com.siportal.portal.domain.UserRole;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRole.PrimaryKey> {

    Optional<UserRole> findByUserId(String userId);

    void deleteByUserId(String userId);


    @Modifying
    @Transactional
    @Query(value = "UPDATE p_user_role SET role_id = :newRoleId WHERE user_id = :userId ", nativeQuery = true)
    void updateRoleId(String userId, Integer newRoleId);
}
