package com.siportal.portal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Entity
@Table(name = "bar_yield_lot")
public class BarYieldLot {

    @Id
    @Column(name = "lot_no")
    private String lotNo;

    @Column(name = "heat_no")
    private String heatNo;

    @Column(name = "item_type")
    private String itemType;

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

    @Column(name = "order_width")
    private BigDecimal orderWidth;

    @Column(name = "integrated_yield")
    private BigDecimal integratedYield;

    @Column(name = "final_yield")
    private BigDecimal finalYield;

    @Column(name = "excess_std_value")
    private BigDecimal excessStdValue;

    @Column(name = "excess_yn")
    private String excessYn;

    @Column(name = "yield_diff")
    private BigDecimal yieldDiff;

    @Column(name = "period_year")
    private Integer periodYear;

    @Column(name = "period_month")
    private Integer periodMonth;

    @Column(name = "eval_unit")
    private String evalUnit;

    @Column(name = "lcm_effect")
    private BigDecimal lcmEffect;

    @Column(name = "lcm_impact_total")
    private BigDecimal lcmImpactTotal;

    @Column(name = "inbound_qty_total")
    private BigDecimal inboundQtyTotal;

    @Column(name = "inbound_ratio")
    private BigDecimal inboundRatio;

    @Column(name = "final_lcm_impact")
    private BigDecimal finalLcmImpact;
}