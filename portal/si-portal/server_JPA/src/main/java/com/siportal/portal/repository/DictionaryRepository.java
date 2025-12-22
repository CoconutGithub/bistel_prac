package com.siportal.portal.repository;

import com.siportal.portal.domain.Dictionary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DictionaryRepository extends JpaRepository<Dictionary, Long> {
    List<Dictionary> findAllByOrderByCreatedAtDesc();

    Optional<Dictionary> findByDictKey(String dictKey);

    boolean existsByDictKey(String dictKey);
}
