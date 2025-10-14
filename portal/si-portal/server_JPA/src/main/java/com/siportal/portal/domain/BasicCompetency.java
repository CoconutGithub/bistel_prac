package com.siportal.portal.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "basic_competency")
public class BasicCompetency {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "competency", length = 50)
    private String competency;

    @Column(name = "competency_description", length = 200)
    private String competencyDescription;


}
