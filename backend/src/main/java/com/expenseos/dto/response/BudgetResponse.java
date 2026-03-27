package com.expenseos.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private double usagePercent;
    private int month;
    private int year;
    private boolean exceeded;
}
