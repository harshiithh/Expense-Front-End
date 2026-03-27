package com.expenseos.repository;

import com.expenseos.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {

    List<Income> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT i FROM Income i WHERE i.user.id = :uid AND i.date BETWEEN :start AND :end ORDER BY i.date DESC")
    List<Income> findByUserAndDateRange(@Param("uid") Long userId,
                                        @Param("start") LocalDate start,
                                        @Param("end") LocalDate end);

    @Query("SELECT SUM(i.amount) FROM Income i WHERE i.user.id = :uid AND MONTH(i.date) = :month AND YEAR(i.date) = :year")
    BigDecimal sumByUserAndMonth(@Param("uid") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT MONTH(i.date), SUM(i.amount) FROM Income i WHERE i.user.id = :uid AND YEAR(i.date) = :year GROUP BY MONTH(i.date) ORDER BY MONTH(i.date)")
    List<Object[]> monthlyTotals(@Param("uid") Long userId, @Param("year") int year);
}
