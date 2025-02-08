package com.siportal.portal.dto;


public interface MenuDto {
    Integer getMenuId();
    String getTitle();
    String getPath();
    String getComponentPath();
    Integer getParentMenuId();
    Integer getDepth();
    String getChildYn();

    String getMenuName();
    String getParentMenuName();
}
