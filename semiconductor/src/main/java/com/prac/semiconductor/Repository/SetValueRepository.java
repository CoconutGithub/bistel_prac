package com.prac.semiconductor.Repository;

import com.prac.semiconductor.Domain.SetValue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SetValueRepository extends JpaRepository<SetValue, Integer> {
    List<SetValue> findByEquipmentEquipmentID(Integer equipmentId);
}
