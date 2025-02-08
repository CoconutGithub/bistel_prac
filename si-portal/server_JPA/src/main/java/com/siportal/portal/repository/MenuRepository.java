package com.siportal.portal.repository;

import com.siportal.portal.domain.Menu;
import com.siportal.portal.dto.MenuDto;
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
            A.MENU_ID,
            CASE WHEN :langCode = 'KO' THEN A.KO_NAME
                 WHEN :langCode = 'CN' THEN A.CN_NAME
                 WHEN :langCode = 'EN' THEN A.EN_NAME
            END AS MENU_NAME,
            A.PARENT_MENU_ID,
            NVL( CASE WHEN :langCode = 'KO' THEN B.KO_NAME
                    WHEN :langCode = 'CN' THEN B.CN_NAME
                    WHEN :langCode = 'EN' THEN B.EN_NAME
                END
            '-') AS PARENT_MENU_NAME
            A.PATH,
            A.POSITION,
            A.CHILD_YN,
            A.STATUS
        FROM
            P_MENU A
        LEFT JOIN
            P_MENU B
        ON
            A.PARENT_MENU_ID = B.MENU_ID
        ORDER BY A.DEPTH, A.POSITION    
    """, nativeQuery = true)
    List<MenuDto> getMenuTree4ManageMenu(String langCode);

    @Query(value = """
        SELECT
            A.MENU_ID AS menuId,
            CASE WHEN :langCode = 'KO' THEN A.KO_NAME
                 WHEN :langCode = 'CN' THEN A.CN_NAME
                 WHEN :langCode = 'EN' THEN A.EN_NAME
            END AS title,
            A.PATH AS path,
            A.COMPONENT_PATH AS componentPath,
            A.PARENT_MENU_ID AS parentMenuId,
            A.DEPTH AS depth,
            A.CHILD_YN AS childYn
        FROM P_MENU A
        WHERE A.STATUS = 'ACTIVE'
        ORDER BY A.DEPTH, A.POSITION
    """, nativeQuery = true)
    List<MenuDto> getAllMenuTreeList(String langCode);


    @Query(value = """
        SELECT
            A.MENU_ID
            , CASE WHEN :langCode = 'KO' THEN A.KO_NAME
                 WHEN :langCode = 'CN' THEN A.CN_NAME
                 WHEN :langCode = 'EN' THEN A.EN_NAME
                END AS TITLE
            , A.PATH
            , A.COMPONENT_PATH
            , A.PARENT_MENU_ID
            , A.DEPTH
            , A.CHILD_YN
        FROM P_MENU A
        , p_permission B
        WHERE 1=1
        and A.STATUS = 'ACTIVE'
        AND A.MENU_ID = B.menu_id
        and B.ROLE_ID =  :roleId
        ORDER BY A.DEPTH, A.POSITION        
    """, nativeQuery = true)
    List<MenuDto> getMyMenuTreeList(String langCode, Integer roleId);


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
        SET m.koName = :menuName, 
            m.path = :path, 
            m.position = :position, 
            m.status = :status, 
            m.updateDate = CURRENT_TIMESTAMP, 
            m.updateBy = :userId
        WHERE m.menuId = :menuId
    """)
    int updateMenuContent(Integer menuId, String menuName, String path, Integer position, String status, String userId);


}
