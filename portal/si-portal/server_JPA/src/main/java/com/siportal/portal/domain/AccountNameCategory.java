package com.siportal.portal.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Builder
@Entity
@Table(name = "account_name_category")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountNameCategory {

    @Id
    private Integer categoryId;
    private String categoryName;
    private Integer categoryCode;
    private Integer level;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private AccountNameCategory parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<AccountNameCategory> children = new ArrayList<>();

    @Column(name = "parent_id", updatable = false, insertable = false)
    @JsonBackReference
    private Integer parentId;
}
