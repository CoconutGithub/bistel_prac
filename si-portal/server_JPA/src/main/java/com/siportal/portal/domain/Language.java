package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "p_language")
@Getter
@Setter
public class Language {
    @Id
    @Column(name = "lang_code")
    private String langCode;

    @Column(name = "lang_name")
    private String langName;

    @Column(name = "lang_order")
    private Integer langOrder;
}
