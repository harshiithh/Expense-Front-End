package com.expenseos.controller;

import com.expenseos.dto.request.BudgetRequest;
import com.expenseos.dto.response.*;
import com.expenseos.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> current() {
        return ResponseEntity.ok(ApiResponse.ok("Success", budgetService.getCurrentMonthBudgets()));
    }

    @GetMapping("/{month}/{year}")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> forMonth(@PathVariable int month,
                                                                       @PathVariable int year) {
        return ResponseEntity.ok(ApiResponse.ok("Success", budgetService.getBudgetsForMonth(month, year)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createOrUpdate(@Valid @RequestBody BudgetRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Budget saved", budgetService.createOrUpdate(req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        budgetService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Budget deleted", null));
    }
}
