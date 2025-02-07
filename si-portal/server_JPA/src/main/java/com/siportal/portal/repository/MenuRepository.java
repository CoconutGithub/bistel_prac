package com.siportal.portal.repository;

import com.siportal.portal.domain.Menu;
import com.siportal.portal.dto.MenuRoleDTO;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Integer> {

    @Query(value = """
        SELECT 
            ROW_NUMBER() OVER (ORDER BY b.CREATE_DATE DESC) AS grid_row_id,
            b.PERMISSION_ID AS permissionId,  
            c.ROLE_NAME AS roleName,         
            b.CAN_CREATE AS canCreate,
            b.CAN_READ AS canRead,
            b.CAN_UPDATE AS canUpdate,
            b.CAN_DELETE AS canDelete,
            b.CREATE_DATE AS createDate,
            b.CREATE_BY AS createBy,
            b.UPDATE_DATE AS updateDate,
            b.UPDATE_BY AS updateBy
        FROM P_PERMISSION b                  
        JOIN P_MENU a ON b.MENU_ID = a.MENU_ID  
        JOIN P_ROLE c ON b.ROLE_ID = c.ROLE_ID  
        WHERE a.MENU_ID = :menuId            
        ORDER BY b.CREATE_DATE DESC
    """, nativeQuery = true)
    List<MenuRoleDTO> getMenuRole(@Param("menuId") Integer menuId);

    @Modifying
    @Transactional
    @Query("""
        UPDATE Menu m 
        SET m.menuName = :menuName, 
            m.path = :path, 
            m.position = :position, 
            m.status = :status, 
            m.updateDate = CURRENT_TIMESTAMP, 
            m.updateBy = :userId
        WHERE m.menuId = :menuId
    """)
    int updateMenuContent(Integer menuId, String menuName, String path, Integer position, String status, String userId);


}
