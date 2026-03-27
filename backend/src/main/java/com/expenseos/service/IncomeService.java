package com.expenseos.service;

import com.expenseos.dto.request.IncomeRequest;
import com.expenseos.dto.response.IncomeResponse;
import java.time.LocalDate;
import java.util.List;

public interface IncomeService {
    IncomeResponse create(IncomeRequest request);
    IncomeResponse update(Long id, IncomeRequest request);
    void delete(Long id);
    List<IncomeResponse> getAll();
    List<IncomeResponse> getByDateRange(LocalDate start, LocalDate end);
}
