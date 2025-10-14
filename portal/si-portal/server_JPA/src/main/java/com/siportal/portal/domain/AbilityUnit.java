package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "ability_unit")
public class AbilityUnit {

    @Id
    @Column(name = "id",length=50)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(name = "detail_classification",length=50)
    private String detailClassification;

    @Column(name = "unit_name",length=50)
    private String unitName;

    @Column(name = "category",length=50)
    private String category;

    @Column(name = "standard_training_time")
    private Integer standardTrainingTime;

    @Column(name = "off_jt")
    private Integer offJt;

    @Column(name = "ojt")
    private Integer ojt;

    @Column(name = "task", length = 50)
    private String task;



}
