package com.expenseos.repository;

import com.expenseos.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :uid AND e.date BETWEEN :start AND :end ORDER BY e.date DESC")
    List<Expense> findByUserAndDateRange(@Param("uid") Long userId,
                                         @Param("start") LocalDate start,
                                         @Param("end") LocalDate end);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :uid AND e.category.id = :cid ORDER BY e.date DESC")
    List<Expense> findByUserAndCategory(@Param("uid") Long userId, @Param("cid") Long categoryId);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :uid AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    BigDecimal sumByUserAndMonth(@Param("uid") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT e.category.name, SUM(e.amount) FROM Expense e WHERE e.user.id = :uid AND MONTH(e.date) = :month AND YEAR(e.date) = :year GROUP BY e.category.name")
    List<Object[]> sumByCategoryForMonth(@Param("uid") Long userId, @Param("month") int month, @Param("year") int year);

    @Query("SELECT MONTH(e.date), SUM(e.amount) FROM Expense e WHERE e.user.id = :uid AND YEAR(e.date) = :year GROUP BY MONTH(e.date) ORDER BY MONTH(e.date)")
    List<Object[]> monthlyTotals(@Param("uid") Long userId, @Param("year") int year);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :uid AND LOWER(e.description) LIKE LOWER(CONCAT('%',:q,'%')) ORDER BY e.date DESC")
    List<Expense> searchByDescription(@Param("uid") Long userId, @Param("q") String query);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :uid AND e.category.id = :cid AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
    BigDecimal sumByCategoryAndMonth(@Param("uid") Long userId, @Param("cid") Long categoryId,
                                     @Param("month") int month, @Param("year") int year);
}
