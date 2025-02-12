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
            CASE WHEN A.MSG_ID IS NULL THEN A.MENU_NAME
                ELSE C.LANG_TEXT END AS MENU_NAME,
            A.PARENT_MENU_ID,
            B.MENU_NAME AS PARENT_MENU_NAME,
            C.MSG_ID,
            A.PATH,
            A.POSITION,
            A.CHILD_YN,
            A.STATUS
        FROM
            P_MENU A
        LEFT JOIN P_MENU B
            ON A.PARENT_MENU_ID = B.MENU_ID
        LEFT JOIN (
            SELECT M1.MSG_ID, M2.LANG_TEXT
            FROM P_MSG_MAIN M1
                JOIN P_MSG_DETAIL M2
            ON M1.MSG_ID = M2.MSG_ID
            WHERE M2.LANG_CODE = :langCode
            AND M1.MSG_TYPE ='menu'        
        ) C   
            ON A.MSG_ID = C.MSG_ID
        ORDER BY A.DEPTH, A.POSITION    
    """, nativeQuery = true)
    List<MenuDto> getMenuTree4ManageMenu(String langCode);

    @Query(value = """
        SELECT
            A.MENU_ID,
            CASE WHEN B.MSG_ID IS NULL THEN A.MENU_NAME
                ELSE B.LANG_TEXT
            END AS TITLE,
            A.PATH AS PATH,
            A.POSITION AS POSITION,
            A.COMPONENT_PATH,
            A.PARENT_MENU_ID,
            A.DEPTH AS DEPTH,
            A.CHILD_YN,
            A.STATUS
        FROM P_MENU A
            LEFT JOIN
            (
                SELECT M1.MSG_ID, M2.LANG_TEXT
                FROM P_MSG_MAIN M1
                    JOIN P_MSG_DETAIL M2
                ON M1.MSG_ID = M2.MSG_ID
                WHERE M2.LANG_CODE = :langCode
                AND M1.MSG_TYPE ='label'
            ) B
            ON A.MSG_ID = B.MSG_ID
        WHERE A.STATUS = 'ACTIVE'
        ORDER BY A.DEPTH, A.POSITION        
    """, nativeQuery = true)
    List<MenuDto> getAllMenuTreeList(String langCode);


    @Query(value = """
        SELECT
            A.MENU_ID,
            CASE WHEN A.MSG_ID IS NULL THEN A.MENU_NAME
                ELSE C.LANG_TEXT
            END AS TITLE,
            A.PATH AS PATH,
            A.POSITION AS POSITION,
            A.COMPONENT_PATH,
            A.PARENT_MENU_ID,
            A.DEPTH AS DEPTH,
            A.CHILD_YN,
            A.STATUS
        FROM P_MENU A
            JOIN P_PERMISSION B
                ON A.MENU_ID = B.MENU_ID
            LEFT JOIN
            (
                SELECT M1.MSG_ID, M2.LANG_TEXT
                FROM P_MSG_MAIN M1
                    JOIN P_MSG_DETAIL M2
                ON M1.MSG_ID = M2.MSG_ID
                WHERE M2.LANG_CODE = :langCode
                AND M1.MSG_TYPE ='label'
            ) C
                ON A.MSG_ID = C.MSG_ID
        WHERE 1=1
        AND A.STATUS = 'ACTIVE'
        AND B.ROLE_ID =  :roleId
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
        SET m.menuName = :menuName, 
            m.path = :path, 
            m.position = :position, 
            m.status = :status, 
            m.msgId = :msgId,
            m.updateDate = CURRENT_TIMESTAMP, 
            m.updateBy = :userId
        WHERE m.menuId = :menuId
    """)
    int updateMenuContent(Integer menuId, String menuName, String path, Integer position, String status, String userId, Integer msgId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Menu m WHERE m.menuId = :menuId OR m.parentMenuId = :menuId")
    void deleteByMenuId(@Param("menuId") Integer menuId);
}
