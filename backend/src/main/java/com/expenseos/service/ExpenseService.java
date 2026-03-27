package com.expenseos.service;

import com.expenseos.dto.request.ExpenseRequest;
import com.expenseos.dto.response.ExpenseResponse;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseService {
    ExpenseResponse create(ExpenseRequest request);
    ExpenseResponse update(Long id, ExpenseRequest request);
    void delete(Long id);
    List<ExpenseResponse> getAll();
    ExpenseResponse getById(Long id);
    List<ExpenseResponse> getByDateRange(LocalDate start, LocalDate end);
    List<ExpenseResponse> getByCategory(Long categoryId);
    List<ExpenseResponse> search(String query);
    byte[] exportToCsv();
}
