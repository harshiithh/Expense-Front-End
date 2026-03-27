package com.expenseos.service.impl;

import com.expenseos.dto.request.BudgetRequest;
import com.expenseos.dto.response.BudgetResponse;
import com.expenseos.entity.*;
import com.expenseos.exception.ResourceNotFoundException;
import com.expenseos.repository.*;
import com.expenseos.service.BudgetService;
import com.expenseos.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final SecurityUtils securityUtils;

    private BudgetResponse toResponse(Budget b, Long userId) {
        BigDecimal spent = expenseRepository.sumByCategoryAndMonth(
                userId, b.getCategory().getId(), b.getMonth(), b.getYear());
        if (spent == null) spent = BigDecimal.ZERO;
        double pct = spent.divide(b.getLimitAmount(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
        return BudgetResponse.builder()
                .id(b.getId()).categoryId(b.getCategory().getId())
                .categoryName(b.getCategory().getName()).categoryColor(b.getCategory().getColor())
                .limitAmount(b.getLimitAmount()).spentAmount(spent)
                .usagePercent(Math.min(pct, 100)).month(b.getMonth()).year(b.getYear())
                .exceeded(spent.compareTo(b.getLimitAmount()) > 0).build();
    }

    @Override
    public BudgetResponse createOrUpdate(BudgetRequest req) {
        User user = securityUtils.getCurrentUser();
        Category cat = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        Budget budget = budgetRepository.findByUserCategoryAndMonth(
                user.getId(), req.getCategoryId(), req.getMonth(), req.getYear())
                .orElse(Budget.builder().category(cat).user(user).month(req.getMonth()).year(req.getYear()).build());
        budget.setLimitAmount(req.getLimitAmount());
        return toResponse(budgetRepository.save(budget), user.getId());
    }

    @Override
    public List<BudgetResponse> getCurrentMonthBudgets() {
        LocalDate now = LocalDate.now();
        return getBudgetsForMonth(now.getMonthValue(), now.getYear());
    }

    @Override
    public List<BudgetResponse> getBudgetsForMonth(int month, int year) {
        User user = securityUtils.getCurrentUser();
        return budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year)
                .stream().map(b -> toResponse(b, user.getId())).toList();
    }

    @Override
    public void delete(Long id) {
        Budget b = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        if (!b.getUser().getId().equals(securityUtils.getCurrentUser().getId()))
            throw new IllegalArgumentException("Unauthorized");
        budgetRepository.delete(b);
    }
}
