package com.prac.semiconductor.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.prac.semiconductor.Domain.Process;

public interface ProcessRepository extends JpaRepository<Process, Integer> {

    List<Process> findByLineLineID(Integer lineId);
}
