package com.siportal.portal.repository;

import com.siportal.portal.domain.Permission;
import com.siportal.portal.dto.PPermissionDTO;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer> {

    // INSERT operation
    @Modifying
    @Transactional
    default void createMenuRole(Integer roleId, Integer menuId, String canCreate, String canRead, String canUpdate, String canDelete) {
        Permission permission = new Permission();
        permission.setRoleId(roleId);
        permission.setMenuId(menuId);
        permission.setCanCreate(canCreate != null ? canCreate : "N");
        permission.setCanRead(canRead != null ? canRead : "N");
        permission.setCanUpdate(canUpdate != null ? canUpdate : "N");
        permission.setCanDelete(canDelete != null ? canDelete : "N");
        permission.setCreateBy("ADMIN");
        permission.setCreateDate(java.time.LocalDateTime.now());

        // Save the permission object
        save(permission);
    }

    // Update operation
    @Modifying
    @Transactional
    @Query("""
        UPDATE Permission p 
        SET p.canCreate = :canCreate, p.canRead = :canRead, p.canUpdate = :canUpdate, p.canDelete = :canDelete, 
            p.updateDate = CURRENT_TIMESTAMP, p.updateBy = 'ADMIN'
        WHERE p.permissionId = :permissionId 
        AND p.roleId = :roleId 
        AND p.menuId = :menuId
    """)
    void updateMenuRole(Integer permissionId, Integer roleId, Integer menuId, String canCreate, String canRead, String canUpdate, String canDelete);

    // Delete operation
    @Modifying
    @Transactional
    @Query("""
        DELETE FROM Permission p 
        WHERE p.permissionId = :permissionId 
        AND p.roleId = :roleId 
        AND p.menuId = :menuId
    """)
    void deleteMenuRole(Integer permissionId, Integer roleId, Integer menuId);

    // Query to get data as PPermissionDTO
    @Query("""
        SELECT p.permissionId AS permissionId,
               r.roleName AS roleName,
               p.canCreate AS canCreate,
               p.canRead AS canRead,
               p.canUpdate AS canUpdate,
               p.canDelete AS canDelete,
               p.createDate AS createDate,
               p.createBy AS createBy,
               p.updateDate AS updateDate,
               p.updateBy AS updateBy
        FROM Permission p
        JOIN p.role r
    """)
    List<PPermissionDTO> findAllPermissions();
}
