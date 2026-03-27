package com.expenseos.controller;

import com.expenseos.dto.request.IncomeRequest;
import com.expenseos.dto.response.*;
import com.expenseos.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
public class IncomeController {
    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Success", incomeService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> create(@Valid @RequestBody IncomeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Income added", incomeService.create(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> update(@PathVariable Long id,
                                                              @Valid @RequestBody IncomeRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Income updated", incomeService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        incomeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Income deleted", null));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> byRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.ok("Success", incomeService.getByDateRange(start, end)));
    }
}
