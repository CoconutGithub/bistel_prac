package com.siportal.portal.repository;

import com.siportal.portal.dto.UserDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class LoginRepository {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * 사용자 ID로 로그인 데이터를 조회하는 메서드
     * @param databaseType 데이터베이스 타입 (postgresql 또는 oracle)
     * @param userId 사용자 ID
     * @return 사용자 로그인 데이터 목록
     */
    public List<UserDto> getLoginDataByUserId(String databaseType, String userId) {
        StringBuilder sql = new StringBuilder();
        sql.append(" SELECT A.USER_ID ");
        sql.append("\n , A.USER_NAME ");
        sql.append("\n , A.EMAIL ");
        sql.append("\n , A.PHONE_NUMBER ");
        sql.append("\n , A.STATUS ");
        sql.append("\n , A.PASSWORD ");
        sql.append("\n , C.ROLE_NAME ");
        sql.append("\n , A.FOOTER_YN ");
        sql.append("\n , A.HEADER_COLOR ");

        if ("postgresql".equalsIgnoreCase(databaseType)) {
            sql.append("\n , CAST(C.ROLE_ID AS TEXT) AS ROLE_ID ");
        } else if ("oracle".equalsIgnoreCase(databaseType)) {
            sql.append("\n , TO_CHAR(C.ROLE_ID) AS ROLE_ID ");
        } else {
            throw new UnsupportedOperationException("Unsupported database type: " + databaseType);
        }

        sql.append("\n , C.IS_MIGHTY ");
        sql.append("\n , A.LANG_CODE ");
        sql.append("\n FROM P_USER A ");
        sql.append("\n  , P_USER_ROLE B ");
        sql.append("\n  , P_ROLE C ");
        sql.append("\n WHERE 1=1 ");
        sql.append("\n AND A.USER_ID = B.USER_ID ");
        sql.append("\n AND B.ROLE_ID = C.ROLE_ID ");
        sql.append("\n AND A.USER_ID = :userId");

        // UserDto 대신 Object[]로 결과를 가져옴
        Query query = entityManager.createNativeQuery(sql.toString());
        query.setParameter("userId", userId);

        @SuppressWarnings("unchecked")
        List<Object[]> resultList = query.getResultList();

        // Object[] 배열을 UserDto로 매핑
        List<UserDto> userDtoList = resultList.stream()
                .map(result -> new UserDto(
                        (String) result[0],  // userId
                        (String) result[1],  // userName
                        (String) result[2],  // email
                        (String) result[3],  // phoneNumber
                        (String) result[4],  // status
                        (String) result[5],  // password
                        (String) result[6],  // roleName
                        result[7] != null ? result[7].toString() : null,  // footerYN (Character -> String)
                        (String) result[8],  // headerColor
                        (String) result[9],  // roleId
                        result[10] != null ? result[10].toString() : null, // isMighty (Character -> String)
                        (String) result[11]  // langCode
                ))
                .collect(Collectors.toList());

        return userDtoList;

    }

    /**
     * 사용자 상태를 업데이트하는 메서드
     * @param userId 사용자 ID
     */
    @Transactional
    public void updateLastLoginDate(String userId) {
        String sql = "UPDATE P_USER SET LAST_LOGIN_DATE = CURRENT_TIMESTAMP  WHERE USER_ID = :userId";

        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("userId", userId);

        int updatedRows = query.executeUpdate();
        if (updatedRows == 0) {
            throw new IllegalStateException("No rows were updated. User ID may not exist: " + userId);
        }
    }
}
