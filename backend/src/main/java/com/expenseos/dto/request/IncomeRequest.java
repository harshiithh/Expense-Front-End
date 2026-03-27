package com.expenseos.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
@Data
public class IncomeRequest {
    @NotNull @DecimalMin("0.01") private BigDecimal amount;
    @NotBlank @Size(max = 255) private String description;
    @NotNull private LocalDate date;
    private Long categoryId;
    private String source;
}
