package com.siportal.portal.repository;

import com.siportal.portal.domain.Language;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LanguageRepository extends JpaRepository<Language, String> {
    List<Language> findAllByOrderByLangOrderAsc();
}
