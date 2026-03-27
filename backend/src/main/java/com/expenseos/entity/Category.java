package com.expenseos.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 10)
    private String icon;

    @Column(length = 7)
    private String color;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CategoryType type;

    public enum CategoryType { EXPENSE, INCOME, BOTH }
}
