package com.expenseos.controller;

import com.expenseos.dto.response.*;
import com.expenseos.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok("Success", analyticsService.getDashboard()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> categories(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        LocalDate now = LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok("Success",
                analyticsService.getCategoryBreakdown(month == 0 ? now.getMonthValue() : month,
                        year == 0 ? now.getYear() : year)));
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<List<DashboardResponse.MonthlyData>>> trends(
            @RequestParam(defaultValue = "0") int year) {
        return ResponseEntity.ok(ApiResponse.ok("Success",
                analyticsService.getMonthlyTrends(year == 0 ? LocalDate.now().getYear() : year)));
    }
}
