package com.siportal.portal.repository;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Query(value = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY A.CREATE_DATE DESC) as GRID_ROW_ID,
                A.USER_ID, A.USER_NAME, A.EMAIL, A.PHONE_NUMBER, A.STATUS,
                A.CREATE_DATE, A.UPDATE_DATE, A.LAST_LOGIN_DATE, A.UPDATE_BY,
                C.ROLE_NAME, C.ROLE_ID
            FROM P_USER A
                JOIN P_USER_ROLE B ON A.USER_ID = B.USER_ID
                JOIN P_ROLE C ON B.ROLE_ID = C.ROLE_ID
            WHERE A.USER_NAME = :userName
            ORDER BY A.CREATE_DATE DESC
            """, nativeQuery = true)
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);

    @Query(value = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY A.CREATE_DATE DESC) as GRID_ROW_ID,
                A.USER_ID, A.USER_NAME, A.EMAIL, A.PHONE_NUMBER, A.STATUS,
                A.CREATE_DATE, A.UPDATE_DATE, A.LAST_LOGIN_DATE, A.UPDATE_BY,
                C.ROLE_NAME, C.ROLE_ID
            FROM P_USER A
                JOIN P_USER_ROLE B ON A.USER_ID = B.USER_ID
                JOIN P_ROLE C ON B.ROLE_ID = C.ROLE_ID
            WHERE 1=1
            ORDER BY A.CREATE_DATE DESC
            """, nativeQuery = true)
    List<ComResultMap> getUserAll();
}

