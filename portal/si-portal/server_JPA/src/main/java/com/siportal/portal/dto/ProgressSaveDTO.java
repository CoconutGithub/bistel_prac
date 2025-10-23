package com.siportal.portal.dto;

import com.siportal.portal.domain.ProjectProgressDetail;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProgressSaveDTO {

    private List<ProjectProgressDetail> createList;
    private List<ProjectProgressDetail> updateList;
    private List<ProjectProgressDetail> deleteList;
}
