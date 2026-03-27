package com.expenseos.service;

import com.expenseos.dto.response.DashboardResponse;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

public interface AnalyticsService {
    DashboardResponse getDashboard();
    Map<String, BigDecimal> getCategoryBreakdown(int month, int year);
    List<DashboardResponse.MonthlyData> getMonthlyTrends(int year);
}
