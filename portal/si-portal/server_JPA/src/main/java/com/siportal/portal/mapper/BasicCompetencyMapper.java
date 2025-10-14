package com.siportal.portal.mapper;

import com.siportal.portal.domain.BasicCompetency;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BasicCompetencyMapper {

    @Select("SELECT * FROM basic_competency")
    List<BasicCompetency> getBasicCompetency();
}
