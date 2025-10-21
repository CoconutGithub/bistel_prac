package com.siportal.portal.dto;

import com.siportal.portal.domain.Project;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProjectSaveDTO {
    // AgGridWrapper의 createList와 매핑
    private List<Project> createList;

    // AgGridWrapper의 updateList와 매핑
    private List<Project> updateList;

    // AgGridWrapper의 deleteList와 매핑
    private List<Project> deleteList;
}
