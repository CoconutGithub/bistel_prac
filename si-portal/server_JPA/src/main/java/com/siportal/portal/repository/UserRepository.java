package com.siportal.portal.repository;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.domain.User;
import com.siportal.portal.dto.UserDto;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Integer> {

    @Query(value = """
        SELECT A.USER_ID
            , A.USER_NAME
            , A.EMAIL
            , A.PHONE_NUMBER
            , A.STATUS
            , A.PASSWORD
            , C.ROLE_NAME
            , A.FOOTER_YN
            , A.HEADER_COLOR
            , CAST(C.ROLE_ID AS TEXT) AS ROLE_ID
            , C.IS_MIGHTY
            , A.LANG_CODE
        FROM P_USER A
            , P_USER_ROLE B
            , P_ROLE C
        WHERE 1=1
            AND A.STATUS ='ACTIVE'
            AND A.USER_ID = B.USER_ID
            AND B.ROLE_ID = C.ROLE_ID
            AND A.USER_ID = #{userId}
    """, nativeQuery = true)
    UserDto getLoginDataByUserId(@Param("userId") String userName);

    //사용자명으로 사용자를 조회 한다.
    @Query(value = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY A.CREATE_DATE DESC) as GRID_ROW_ID,
                A.USER_ID, 
                A.USER_NAME, 
                A.EMAIL, 
                A.PHONE_NUMBER, 
                A.STATUS,
                TO_CHAR(A.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE,
                TO_CHAR(A.UPDATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS UPDATE_DATE,
                TO_CHAR(A.LAST_LOGIN_DATE, 'YYYY-MM-DD HH24:MI:SS') AS LAST_LOGIN_DATE, 
                A.UPDATE_BY,
                C.ROLE_NAME, 
                C.ROLE_ID, 
                A.LANG_CODE
            FROM P_USER A
                JOIN P_USER_ROLE B ON A.USER_ID = B.USER_ID
                JOIN P_ROLE C ON B.ROLE_ID = C.ROLE_ID
            WHERE A.USER_NAME = :userName
            ORDER BY A.CREATE_DATE DESC
            """, nativeQuery = true)
    List<ComResultMap> getUserByUserName(@Param("userName") String userName);

    //모든 사용자를 다 조회해 온다.
    @Query(value = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY A.CREATE_DATE DESC) as GRID_ROW_ID,
                A.USER_ID, 
                A.USER_NAME, 
                A.EMAIL, 
                A.PHONE_NUMBER, 
                A.STATUS,
                TO_CHAR(A.CREATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS CREATE_DATE,
                TO_CHAR(A.UPDATE_DATE, 'YYYY-MM-DD HH24:MI:SS') AS UPDATE_DATE,
                TO_CHAR(A.LAST_LOGIN_DATE, 'YYYY-MM-DD HH24:MI:SS') AS LAST_LOGIN_DATE,                 
                A.UPDATE_BY,
                C.ROLE_NAME, 
                C.ROLE_ID, 
                A.LANG_CODE
            FROM P_USER A
                JOIN P_USER_ROLE B ON A.USER_ID = B.USER_ID
                JOIN P_ROLE C ON B.ROLE_ID = C.ROLE_ID
            WHERE 1=1
            ORDER BY A.CREATE_DATE DESC
            """, nativeQuery = true)
    List<ComResultMap> getUserAll();

    //사용자id로 사용자가 존재하는지 찾는다.
    boolean existsByUserId(String userId);

    void deleteByUserId(String userId);

    Optional<User> findByUserId(String userId);

    @Query("SELECT u.profileImage FROM User u WHERE u.userId = :userId")
    Optional<byte[]> findUserProfileImageByUserId(@Param("userId") String userId);

}

