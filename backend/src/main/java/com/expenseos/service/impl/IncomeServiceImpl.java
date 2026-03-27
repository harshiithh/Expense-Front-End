package com.expenseos.service.impl;

import com.expenseos.dto.request.IncomeRequest;
import com.expenseos.dto.response.IncomeResponse;
import com.expenseos.entity.*;
import com.expenseos.exception.ResourceNotFoundException;
import com.expenseos.repository.*;
import com.expenseos.service.IncomeService;
import com.expenseos.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeServiceImpl implements IncomeService {

    private final IncomeRepository incomeRepository;
    private final CategoryRepository categoryRepository;
    private final SecurityUtils securityUtils;

    private IncomeResponse toResponse(Income i) {
        return IncomeResponse.builder()
                .id(i.getId()).amount(i.getAmount()).description(i.getDescription())
                .date(i.getDate()).source(i.getSource()).createdAt(i.getCreatedAt())
                .categoryId(i.getCategory() != null ? i.getCategory().getId() : null)
                .categoryName(i.getCategory() != null ? i.getCategory().getName() : "General")
                .build();
    }

    @Override
    public IncomeResponse create(IncomeRequest req) {
        User user = securityUtils.getCurrentUser();
        Category cat = req.getCategoryId() != null
                ? categoryRepository.findById(req.getCategoryId()).orElse(null) : null;
        Income income = Income.builder().amount(req.getAmount()).description(req.getDescription())
                .date(req.getDate()).source(req.getSource()).category(cat).user(user).build();
        return toResponse(incomeRepository.save(income));
    }

    @Override
    public IncomeResponse update(Long id, IncomeRequest req) {
        User user = securityUtils.getCurrentUser();
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        if (!income.getUser().getId().equals(user.getId()))
            throw new IllegalArgumentException("Unauthorized");
        Category cat = req.getCategoryId() != null
                ? categoryRepository.findById(req.getCategoryId()).orElse(null) : null;
        income.setAmount(req.getAmount()); income.setDescription(req.getDescription());
        income.setDate(req.getDate()); income.setSource(req.getSource()); income.setCategory(cat);
        return toResponse(incomeRepository.save(income));
    }

    @Override
    public void delete(Long id) {
        User user = securityUtils.getCurrentUser();
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income not found"));
        if (!income.getUser().getId().equals(user.getId()))
            throw new IllegalArgumentException("Unauthorized");
        incomeRepository.delete(income);
    }

    @Override
    public List<IncomeResponse> getAll() {
        return incomeRepository.findByUserIdOrderByDateDesc(securityUtils.getCurrentUser().getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<IncomeResponse> getByDateRange(LocalDate start, LocalDate end) {
        return incomeRepository.findByUserAndDateRange(securityUtils.getCurrentUser().getId(), start, end)
                .stream().map(this::toResponse).toList();
    }
}
