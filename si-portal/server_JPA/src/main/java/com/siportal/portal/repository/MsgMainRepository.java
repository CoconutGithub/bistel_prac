package com.siportal.portal.repository;

import com.siportal.portal.com.result.ComResultMap;
import com.siportal.portal.domain.MsgMain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

public interface MsgMainRepository extends JpaRepository<MsgMain, Integer> {
    @Query(value = "SELECT *\n" +
        "           FROM CROSSTAB(\n" +
            "           'SELECT A.MSG_ID, C.MSG_TYPE, C.MSG_NAME, C.MSG_DEFAULT, C.STATUS, A.LANG_CODE, LANG_TEXT\n" +
            "           FROM DEV.P_MSG_DETAIL A\n" +
            "           JOIN DEV.P_LANGUAGE B\n" +
            "           ON A.LANG_CODE = B.LANG_CODE\n" +
            "           JOIN DEV.P_MSG_MAIN C\n" +
            "           ON A.MSG_ID = C.MSG_ID\n" +
            "           ORDER BY 1',\n" +
            "           'VALUES (''KO''), (''EN''), (''CN'')' \n" +
            "           ) AS CT(MSG_ID INT, MSG_TYPE TEXT, MSG_NAME TEXT, MSG_DEFAULT TEXT, STATUS TEXT, KO_LANG_TEXT TEXT, EN_LANG_TEXT TEXT, CN_LANG_TEXT TEXT)\n" +
            "        WHERE\n" +
            "            1 = 1\n" +
            "            AND (:#{#params['msgType']} IS NULL OR :#{#params['msgType']} = '' OR MSG_TYPE LIKE '%' || :#{#params['msgType']} || '%')\n" +
            "            AND (:#{#params['msgName']} IS NULL OR :#{#params['msgName']} = '' OR MSG_NAME LIKE '%' || :#{#params['msgName']} || '%')\n" +
            "            AND (:#{#params['msgDefault']} IS NULL OR :#{#params['msgDefault']} = '' OR MSG_DEFAULT LIKE '%' || :#{#params['msgDefault']} || '%')\n" +
            "            AND (:#{#params['status']} IS NULL OR :#{#params['status']} = '' OR STATUS = :#{#params['status']})\n" +
            "            AND (:#{#params['koLangText']} IS NULL OR :#{#params['koLangText']} = '' OR KO_LANG_TEXT LIKE '%' || :#{#params['koLangText']} || '%')\n" +
            "            AND (:#{#params['enLangText']} IS NULL OR :#{#params['enLangText']} = '' OR EN_LANG_TEXT LIKE '%' || :#{#params['enLangText']} || '%')\n" +
            "            AND (:#{#params['cnLangText']} IS NULL OR :#{#params['cnLangText']} = '' OR CN_LANG_TEXT LIKE '%' || :#{#params['cnLangText']} || '%')\n" , nativeQuery = true)
    List<ComResultMap> getMsgList(@Param("params") Map<String, String> params);

    @Query(value = "SELECT DISTINCT MSG_TYPE FROM DEV.P_MSG_MAIN ORDER BY MSG_TYPE", nativeQuery = true)
    List<ComResultMap> getMsgTypeList();

    @Query(value = "SELECT COUNT(*) AS CNT FROM P_MSG_MAIN WHERE MSG_TYPE = :msgType AND MSG_NAME = :msgName", nativeQuery = true)
    long checkDupMsg(String msgType, String msgName);

    @Query(value = "SELECT NEXTVAL('SEQ_P_MSG')", nativeQuery = true) // SEQ_P_MSG
    Long getSeqMsgId();

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO P_MSG_MAIN (MSG_ID, MSG_TYPE, MSG_NAME, MSG_DEFAULT, STATUS, CREATE_DATE, CREATE_BY) " +
            "VALUES (CAST(:#{#params['msgId']} AS INTEGER), :#{#params['msgType']}, :#{#params['msgName']}, " +
            ":#{#params['msgDefault']}, :#{#params['status']}, NOW(), :#{#params['userId']})", nativeQuery = true)
    int createMsgMain(@Param("params") Map<String, String> params);

    int deleteByMsgTypeAndMsgName(String msgType, String msgName);

    MsgMain findMsgIdByMsgTypeAndMsgName(String msgType, String msgName);  // find msgId by msgType and msgName

    @Modifying
    @Transactional
    @Query(value = "UPDATE P_MSG_MAIN\n" +
            "        SET\n" +
            "           MSG_DEFAULT = :#{#params['msgDefault']}\n" +
            "           , STATUS = :#{#params['status']}\n" +
            "           , UPDATE_DATE = NOW()\n" +
            "           , UPDATE_BY = :#{#params['userId']}\n" +
            "        WHERE\n" +
            "           MSG_TYPE = :#{#params['msgType']}\n" +
            "           AND MSG_NAME = :#{#params['msgName']} ", nativeQuery = true)
    int updateMsgMain(@Param("params") Map<String, String> params);
}
