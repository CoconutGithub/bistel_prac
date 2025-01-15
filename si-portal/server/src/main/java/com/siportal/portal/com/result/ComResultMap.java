package com.siportal.portal.com.result;

import org.apache.commons.collections4.map.ListOrderedMap;

import java.io.IOException;
import java.io.Reader;
import java.io.Serial;
import java.io.Serializable;
import java.sql.SQLException;

public class ComResultMap extends ListOrderedMap<String, Object> implements Serializable {
    @Serial
    private static final long serialVersionUID = -3373848823544700461L;

    // put() 메소드 오버라이드
    @Override
    public Object put(String key, Object value) {

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

    // 상태 설정 메소드
    public void setStatus(String status) {
        this.put("status", status);
    }

    // 메시지 설정 메소드
    public void setMessage(String message) {
        this.put("message", message);
    }

    // 이메일과 관련된 데이터를 설정할 수 있는 메소드
    public void setEmailStatus(String status, String message) {
        this.setStatus(status);
        this.setMessage(message);
    }

    // 필요에 따라 추가적인 메소드들을 추가할 수 있습니다.
    public Object get(String key) {
        return super.get(key);
    }

    public String toString() {
        return super.toString();
    }
}
