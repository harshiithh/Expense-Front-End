package com.expenseos.service.impl;

import com.expenseos.dto.response.*;
import com.expenseos.repository.*;
import com.expenseos.service.*;
import com.expenseos.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final SecurityUtils securityUtils;
    private final ExpenseService expenseService;
    private final IncomeService incomeService;
    private final BudgetService budgetService;

    @Override
    public DashboardResponse getDashboard() {
        Long uid = securityUtils.getCurrentUser().getId();
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue(), year = now.getYear();

        BigDecimal totalIncome = incomeRepository.sumByUserAndMonth(uid, month, year);
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = expenseRepository.sumByUserAndMonth(uid, month, year);
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;
        BigDecimal balance = totalIncome.subtract(totalExpenses);
        BigDecimal savingsRate = totalIncome.compareTo(BigDecimal.ZERO) > 0
                ? balance.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        List<ExpenseResponse> recentExp = expenseService.getAll().stream().limit(5).toList();
        List<IncomeResponse> recentInc = incomeService.getAll().stream().limit(5).toList();
        Map<String, BigDecimal> catBreakdown = getCategoryBreakdown(month, year);
        List<DashboardResponse.MonthlyData> monthlyData = getMonthlyTrends(year);
        List<BudgetResponse> budgetAlerts = budgetService.getCurrentMonthBudgets()
                .stream().filter(b -> b.getUsagePercent() >= 70).toList();

        return DashboardResponse.builder()
                .totalBalance(balance).totalIncome(totalIncome).totalExpenses(totalExpenses)
                .savingsRate(savingsRate.setScale(1, RoundingMode.HALF_UP))
                .recentExpenses(recentExp).recentIncome(recentInc)
                .categoryBreakdown(catBreakdown).monthlyData(monthlyData)
                .budgetAlerts(budgetAlerts).build();
    }

    @Override
    public Map<String, BigDecimal> getCategoryBreakdown(int month, int year) {
        Long uid = securityUtils.getCurrentUser().getId();
        List<Object[]> rows = expenseRepository.sumByCategoryForMonth(uid, month, year);
        Map<String, BigDecimal> map = new LinkedHashMap<>();
        for (Object[] row : rows) map.put((String) row[0], (BigDecimal) row[1]);
        return map;
    }

    @Override
    public List<DashboardResponse.MonthlyData> getMonthlyTrends(int year) {
        Long uid = securityUtils.getCurrentUser().getId();
        List<Object[]> expRows = expenseRepository.monthlyTotals(uid, year);
        List<Object[]> incRows = incomeRepository.monthlyTotals(uid, year);

        Map<Integer, BigDecimal> expMap = new HashMap<>(), incMap = new HashMap<>();
        for (Object[] r : expRows) expMap.put(((Number)r[0]).intValue(), (BigDecimal) r[1]);
        for (Object[] r : incRows) incMap.put(((Number)r[0]).intValue(), (BigDecimal) r[1]);

        List<DashboardResponse.MonthlyData> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            result.add(DashboardResponse.MonthlyData.builder()
                    .month(Month.of(m).name().substring(0,3))
                    .income(incMap.getOrDefault(m, BigDecimal.ZERO))
                    .expenses(expMap.getOrDefault(m, BigDecimal.ZERO)).build());
        }
        return result;
    }
}
