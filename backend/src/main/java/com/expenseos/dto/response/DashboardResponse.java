package com.expenseos.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private BigDecimal totalBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal savingsRate;
    private List<ExpenseResponse> recentExpenses;
    private List<IncomeResponse> recentIncome;
    private Map<String, BigDecimal> categoryBreakdown;
    private List<MonthlyData> monthlyData;
    private List<BudgetResponse> budgetAlerts;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private BigDecimal income;
        private BigDecimal expenses;
    }
}
