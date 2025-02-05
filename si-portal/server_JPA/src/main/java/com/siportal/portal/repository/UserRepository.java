package com.siportal.portal.repository;

import com.siportal.portal.domain.Permission;
import com.siportal.portal.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}

