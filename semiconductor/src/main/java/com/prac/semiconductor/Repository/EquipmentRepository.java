package com.prac.semiconductor.Repository;

import com.prac.semiconductor.Domain.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Integer> {
    List<Equipment> findByProcessProcessID(Integer processId);

}
