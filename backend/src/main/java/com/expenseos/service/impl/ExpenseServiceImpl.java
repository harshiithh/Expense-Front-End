package com.expenseos.service.impl;

import com.expenseos.dto.request.ExpenseRequest;
import com.expenseos.dto.response.ExpenseResponse;
import com.expenseos.entity.*;
import com.expenseos.exception.ResourceNotFoundException;
import com.expenseos.repository.*;
import com.expenseos.service.ExpenseService;
import com.expenseos.util.SecurityUtils;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.io.*;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId()).amount(e.getAmount()).description(e.getDescription())
                .date(e.getDate()).categoryId(e.getCategory().getId())
                .categoryName(e.getCategory().getName()).categoryColor(e.getCategory().getColor())
                .categoryIcon(e.getCategory().getIcon()).paymentMethod(e.getPaymentMethod())
                .notes(e.getNotes()).createdAt(e.getCreatedAt()).build();
    }

    private Expense buildExpense(ExpenseRequest req, User user, Expense existing) {
        Category cat = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        if (existing == null) {
            return Expense.builder().amount(req.getAmount()).description(req.getDescription())
                    .date(req.getDate()).category(cat).user(user)
                    .paymentMethod(req.getPaymentMethod()).notes(req.getNotes()).build();
        }
        existing.setAmount(req.getAmount()); existing.setDescription(req.getDescription());
        existing.setDate(req.getDate()); existing.setCategory(cat);
        existing.setPaymentMethod(req.getPaymentMethod()); existing.setNotes(req.getNotes());
        return existing;
    }

    @Override
    public ExpenseResponse create(ExpenseRequest req) {
        User user = securityUtils.getCurrentUser();
        return toResponse(expenseRepository.save(buildExpense(req, user, null)));
    }

    @Override
    public ExpenseResponse update(Long id, ExpenseRequest req) {
        User user = securityUtils.getCurrentUser();
        Expense exp = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!exp.getUser().getId().equals(user.getId()))
            throw new IllegalArgumentException("Unauthorized");
        return toResponse(expenseRepository.save(buildExpense(req, user, exp)));
    }

    @Override
    public void delete(Long id) {
        User user = securityUtils.getCurrentUser();
        Expense exp = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!exp.getUser().getId().equals(user.getId()))
            throw new IllegalArgumentException("Unauthorized");
        expenseRepository.delete(exp);
    }

    @Override
    public List<ExpenseResponse> getAll() {
        return expenseRepository.findByUserIdOrderByDateDesc(securityUtils.getCurrentUser().getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    public ExpenseResponse getById(Long id) {
        User user = securityUtils.getCurrentUser();
        Expense exp = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!exp.getUser().getId().equals(user.getId()))
            throw new IllegalArgumentException("Unauthorized");
        return toResponse(exp);
    }

    @Override
    public List<ExpenseResponse> getByDateRange(LocalDate start, LocalDate end) {
        return expenseRepository.findByUserAndDateRange(securityUtils.getCurrentUser().getId(), start, end)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ExpenseResponse> getByCategory(Long categoryId) {
        return expenseRepository.findByUserAndCategory(securityUtils.getCurrentUser().getId(), categoryId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ExpenseResponse> search(String query) {
        return expenseRepository.searchByDescription(securityUtils.getCurrentUser().getId(), query)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public byte[] exportToCsv() {
        List<ExpenseResponse> expenses = getAll();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(new String[]{"ID","Description","Amount","Category","Date","Payment Method","Notes"});
            for (ExpenseResponse e : expenses) {
                writer.writeNext(new String[]{
                    String.valueOf(e.getId()), e.getDescription(), e.getAmount().toString(),
                    e.getCategoryName(), e.getDate().toString(),
                    e.getPaymentMethod() != null ? e.getPaymentMethod() : "",
                    e.getNotes() != null ? e.getNotes() : ""
                });
            }
            writer.flush();
            return out.toByteArray();
        } catch (IOException ex) {
            throw new RuntimeException("CSV export failed", ex);
        }
    }
}
