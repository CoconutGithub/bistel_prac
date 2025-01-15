package com.siportal.portal.com;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.mapper.PortalMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sound.sampled.Port;
import java.util.List;
import java.util.Map;

@Component
public class ComPortalDataLoader {

    @Autowired
    private PortalMapper portalMapper;

    private ComPortalData comPortalData; // ComPortalData 媛앹껜

    @PostConstruct
    public void loadPortalData() {
        comPortalData = new ComPortalData();

        List<Map<String, Object>> roleList = portalMapper.getAllRole();
        comPortalData.setRoleList(roleList);
    }

    public List<Map<String, Object>> getRole() {
        return comPortalData.getRoleList();
    }
}
