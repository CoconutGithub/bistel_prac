package com.prac.activemq.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class MessageDTO {
    private String target;
    // 작업에 필요한 데이터
    private String payload;
}
