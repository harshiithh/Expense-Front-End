package com.expenseos.repository;

import com.expenseos.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :uid AND b.category.id = :cid AND b.month = :month AND b.year = :year")
    Optional<Budget> findByUserCategoryAndMonth(@Param("uid") Long userId, @Param("cid") Long categoryId,
                                                 @Param("month") int month, @Param("year") int year);
}
