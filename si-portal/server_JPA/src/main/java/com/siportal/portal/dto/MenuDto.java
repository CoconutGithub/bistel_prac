package com.siportal.portal.dto;


public interface MenuDto {
    Integer getMenuId();
    String getTitle();
    String getPath();
    Integer getPosition();
    String getComponentPath();
    Integer getParentMenuId();
    Integer getDepth();
    String getChildYn();
    String getStatus();

    String getMenuName();
    String getParentMenuName();
}
