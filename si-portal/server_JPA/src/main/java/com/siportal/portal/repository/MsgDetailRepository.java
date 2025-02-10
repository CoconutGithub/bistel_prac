package com.siportal.portal.repository;

import com.siportal.portal.domain.MsgDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

public interface MsgDetailRepository extends JpaRepository<MsgDetail, Integer> {

    @Query(value = "SELECT COUNT(*) AS CNT\n" +
            "       FROM P_MSG_DETAIL\n" +
            "       WHERE MSG_ID = CAST(:#{#params['msgId']} AS INTEGER)\n" +
            "       AND LANG_CODE = :#{#params['langCode']} \n" , nativeQuery = true)
    long checkMsgTextExist(@Param("params") Map<String, String> params);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO P_MSG_DETAIL (MSG_ID, LANG_CODE, LANG_TEXT, CREATE_DATE, CREATE_BY)\n" +
            "        VALUES\n" +
        "            (CAST(:#{#params['msgId']} AS INTEGER), :#{#params['langCode']}, :#{#params['langText']}, NOW(), :#{#params['userId']})", nativeQuery = true)
   int createMsgDetail(@Param("params") Map<String, String> params);

    int save(@Param("params") Map<String, String> params);

    @Modifying
    @Transactional
    @Query(value = "UPDATE P_MSG_DETAIL\n" +
            "    SET\n" +
            "        LANG_TEXT = :#{#params['langText']}\n" +
            "        , UPDATE_DATE = NOW()\n" +
            "        , UPDATE_BY = :#{#params['userId']}\n" +
            "    WHERE\n" +
            "            MSG_ID = CAST(:#{#params['msgId']} AS INTEGER)\n" +
            "    AND LANG_CODE = :#{#params['langCode']}", nativeQuery = true)
    int updateMsgDetail(@Param("params") Map<String, String> params);
}
