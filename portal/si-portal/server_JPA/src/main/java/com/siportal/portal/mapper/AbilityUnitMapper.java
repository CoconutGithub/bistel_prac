package com.siportal.portal.mapper;

import com.siportal.portal.domain.AbilityUnit;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface AbilityUnitMapper {

    @Select("SELECT * FROM ability_unit")
    List<AbilityUnit> getAbilityUnit();
}
