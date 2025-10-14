package com.siportal.portal.dto;

import lombok.Data;

@Data
public class PMenuDTO {
    private Integer menuId;
    private String title;
    private String path;
    private Integer position;
    private String componentPath;
    private Integer parentMenuId;
    private Integer depth;
    private String childYn;
    private String status;

//    // Getters and Setters
//    public Integer getMenuId() { return menuId; }
//    public void setMenuId(Integer menuId) { this.menuId = menuId; }
//
//    public String getTitle() { return title; }
//    public void setTitle(String title) { this.title = title; }
//
//    public String getPath() { return path; }
//    public void setPath(String path) { this.path = path; }
//
//    public String getComponentPath() { return componentPath; }
//    public void setComponentPath(String componentPath) { this.componentPath = componentPath; }
//
//    public Integer getParentMenuId() { return parentMenuId; }
//    public void setParentMenuId(Integer parentMenuId) { this.parentMenuId = parentMenuId; }
//
//    public Integer getDepth() { return depth; }
//    public void setDepth(Integer depth) { this.depth = depth; }
//
//    public String getChildYn() { return childYn; }
//    public void setChildYn(String childYn) { this.childYn = childYn; }
}
