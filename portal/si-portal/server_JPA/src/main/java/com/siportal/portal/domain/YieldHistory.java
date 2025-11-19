package com.siportal.portal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "yield_history")
public class YieldHistory {

    @Id
    @Column(name = "lot_no")
    private String lotNo;

    @Column(name = "heat_no")
    private String heatNo;

    @Column(name = "type")
    private String itemType; // 강관/강봉 구분

    @Column(name = "steel_grade_l")
    private String steelGradeL;

    @Column(name = "steel_grade_m")
    private String steelGradeM;

    @Column(name = "steel_grade_s")
    private String steelGradeS;

    @Column(name = "steel_grade_group")
    private String steelGradeGroup;

    @Column(name = "material_l")
    private String materialL;

    @Column(name = "surface")
    private String surface;

    @Column(name = "shape")
    private String shape;

    @Column(name = "inhouse_steel_name")
    private String inhouseSteelName;

    @Column(name = "work_date")
    private String workDate;

    @Column(name = "input_qty")
    private BigDecimal inputQty;

    @Column(name = "prod_qty")
    private BigDecimal prodQty;

    @Column(name = "yield_rate")
    private BigDecimal yieldRate;

    @Column(name = "prod_material_cd")
    private String prodMaterialCd;

    @Column(name = "order_heat_treat")
    private String orderHeatTreat;

    @Column(name = "order_outer_dia")
    private BigDecimal orderOuterDia;

    @Column(name = "order_inner_dia")
    private BigDecimal orderInnerDia;

    @Column(name = "order_thickness")
    private BigDecimal orderThickness;

    @Column(name = "order_width")
    private BigDecimal orderWidth;

    @Column(name = "integrated_yield")
    private BigDecimal integratedYield;

    @Column(name = "final_yield")
    private BigDecimal finalYield;

//    // Item 그룹핑을 위한 추가 필드 (매핑에는 없지만 조회시 사용)
//    @Column(name = "item_type")
//    private String itemType;
}