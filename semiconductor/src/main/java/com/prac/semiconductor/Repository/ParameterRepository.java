package com.prac.semiconductor.Repository;

import com.prac.semiconductor.Domain.Parameter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParameterRepository extends JpaRepository<Parameter, Integer> {
}
