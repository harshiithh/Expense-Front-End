package com.expenseos.dto.request;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class RegisterRequest {
    @NotBlank @Size(min = 2, max = 100) private String fullName;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6, max = 100) private String password;
}
