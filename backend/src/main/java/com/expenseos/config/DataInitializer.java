package com.expenseos.config;

import com.expenseos.entity.Category;
import com.expenseos.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                Category.builder().name("Food & Dining").icon("🍔").color("#FF6B35").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Transport").icon("🚗").color("#7B61FF").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Housing").icon("🏠").color("#00B4D8").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Shopping").icon("🛍️").color("#FFD23F").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Health").icon("💊").color("#00FFB2").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Entertainment").icon("🎬").color("#FF4757").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Education").icon("📚").color("#2ED573").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Utilities").icon("⚡").color("#1E90FF").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Others").icon("📦").color("#A8A8A8").type(Category.CategoryType.EXPENSE).build(),
                Category.builder().name("Salary").icon("💰").color("#00FFB2").type(Category.CategoryType.INCOME).build(),
                Category.builder().name("Freelance").icon("💻").color("#7B61FF").type(Category.CategoryType.INCOME).build(),
                Category.builder().name("Investment").icon("📈").color("#FFD23F").type(Category.CategoryType.INCOME).build(),
                Category.builder().name("Other Income").icon("💵").color("#FF6B35").type(Category.CategoryType.INCOME).build()
            );
            categoryRepository.saveAll(categories);
        }
    }
}
