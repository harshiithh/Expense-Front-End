package com.expenseos.service;

import com.expenseos.dto.request.BudgetRequest;
import com.expenseos.dto.response.BudgetResponse;
import java.util.List;

public interface BudgetService {
    BudgetResponse createOrUpdate(BudgetRequest request);
    List<BudgetResponse> getCurrentMonthBudgets();
    List<BudgetResponse> getBudgetsForMonth(int month, int year);
    void delete(Long id);
}
