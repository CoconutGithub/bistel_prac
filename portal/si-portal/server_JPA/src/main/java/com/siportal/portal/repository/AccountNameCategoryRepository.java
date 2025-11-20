package com.siportal.portal.repository;

import com.siportal.portal.domain.AccountNameCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountNameCategoryRepository extends JpaRepository<AccountNameCategory,Integer> {

    List<AccountNameCategory> findAllByOrderByLevelDesc();
}
