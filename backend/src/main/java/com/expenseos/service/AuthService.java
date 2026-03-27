package com.expenseos.service;

import com.expenseos.dto.request.*;
import com.expenseos.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
