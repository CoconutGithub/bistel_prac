package com.siportal.portal.service;

import com.siportal.portal.dto.PMenuDTO;
import com.siportal.portal.mapper.PortalMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:9090")
@RequestMapping("/") // API 기본 경로
public class PortalService {

    @Autowired
    private PortalMapper portalMapper;

    @GetMapping("/menu")
    public Map<String, Object> getMenuTreeList() {
        List<PMenuDTO> menus = portalMapper.getMenuTreeList();
        Map<Integer, Map<String, Object>> menuMap = new HashMap<>();
        List<Map<String, Object>> roots = new ArrayList<>();

        List routeList = new ArrayList<>();

        for (PMenuDTO menu : menus) {
            Map<String, Object> menuItem = new HashMap<>();
            menuItem.put("menuId", menu.getMenuId());
            menuItem.put("title", menu.getTitle());
            menuItem.put("path", menu.getPath());
            menuItem.put("componentPath", menu.getComponentPath());
            menuItem.put("children", new ArrayList<>());

            if (menu.getChildYn() != null && menu.getChildYn().equals("N")) {
                routeList.add(menuItem);
            }

            menuMap.put(menu.getMenuId(), menuItem);

            if (menu.getParentMenuId() == null || menu.getParentMenuId() == 0) {
                roots.add(menuItem);
            } else {
                Map<String, Object> parent = menuMap.get(menu.getParentMenuId());
                if (parent != null) {
                    ((List<Map<String, Object>>) parent.get("children")).add(menuItem);
                }
            }
        }

        return Map.of(
                "menuInfo", roots,
                "routeInfo", routeList
        );
    }
}
