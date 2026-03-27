package com.expenseos.controller;

import com.expenseos.dto.response.ApiResponse;
import com.expenseos.entity.Category;
import com.expenseos.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Success", categoryRepository.findAll()));
    }

    @GetMapping("/expense")
    public ResponseEntity<ApiResponse<List<Category>>> expense() {
        return ResponseEntity.ok(ApiResponse.ok("Success",
                categoryRepository.findByType(Category.CategoryType.EXPENSE)));
    }

    @GetMapping("/income")
    public ResponseEntity<ApiResponse<List<Category>>> income() {
        return ResponseEntity.ok(ApiResponse.ok("Success",
                categoryRepository.findByType(Category.CategoryType.INCOME)));
    }
}
