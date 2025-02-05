package com.siportal.portal.com.result;

import org.apache.commons.collections4.map.ListOrderedMap;

import java.io.IOException;
import java.io.Reader;
import java.io.Serial;
import java.io.Serializable;
import java.sql.SQLException;

public class ComResultMap  extends ListOrderedMap<String, Object> implements Serializable {
    @Serial
    private static final long serialVersionUID = -3373848823544700461L;


    // put() 메소드 오버라이드
//    @Override
//    public Object put(String key, Object value) {
//
//        if (value instanceof java.sql.Clob) {
//            value = convertClobToString((java.sql.Clob) value);
//        }
//
//        String camelCaseKey = convertToCamelCase(key);
//
//        return super.put(camelCaseKey, value);
//    }

    @Override
    public Object put(String key, Object value) {
        // key가 null인 경우 처리
        if (key == null) {
            throw new IllegalArgumentException("Key cannot be null");
        }

        // value가 null이어도 처리
        if (value instanceof java.sql.Clob) {
            value = convertClobToString((java.sql.Clob) value);
        }

        String camelCaseKey = convertToCamelCase(key);

        return super.put(camelCaseKey, value);
    }



    private String convertClobToString(java.sql.Clob clob) {
        StringBuilder sb = new StringBuilder();
        try (Reader reader = clob.getCharacterStream()) {
            char[] buffer = new char[1024];
            int bytesRead;
            while ((bytesRead = reader.read(buffer)) != -1) {
                sb.append(buffer, 0, bytesRead);
            }
        } catch (IOException | SQLException e) {
            e.printStackTrace();
            // 필요하면 예외를 로깅하거나 처리
        }
        return sb.toString();
    }

    /**
     * Snake_case를 camelCase로 변환하는 메서드
     */
    private String convertToCamelCase(String key) {
        StringBuilder result = new StringBuilder();
        boolean nextUpperCase = false;

        for (int i = 0; i < key.length(); i++) {
            char c = key.charAt(i);

            if (c == '_') {
                // 다음 문자를 대문자로 변환하도록 설정
                nextUpperCase = true;
            } else if (nextUpperCase) {
                result.append(Character.toUpperCase(c)); // 대문자로 변환
                nextUpperCase = false;
            } else {
                result.append(Character.toLowerCase(c)); // 소문자로 변환
            }
        }

        return result.toString();
    }


    // 필요에 따라 추가적인 메소드들을 추가할 수 있습니다.
    public Object get(String key) {
        return super.get(key);
    }

    public String toString() {
        return super.toString();
    }
}