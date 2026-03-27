package com.expenseos.service.impl;

import com.expenseos.dto.request.*;
import com.expenseos.dto.response.AuthResponse;
import com.expenseos.entity.User;
import com.expenseos.repository.UserRepository;
import com.expenseos.security.JwtUtils;
import com.expenseos.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtils jwtUtils;

    @Override
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already registered");
        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .build();
        userRepository.save(user);
        String token = jwtUtils.generateToken(user.getEmail());
        return AuthResponse.builder().token(token).type("Bearer")
                .id(user.getId()).email(user.getEmail()).fullName(user.getFullName()).build();
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepository.findByEmail(req.getEmail()).orElseThrow();
        String token = jwtUtils.generateToken(user.getEmail());
        return AuthResponse.builder().token(token).type("Bearer")
                .id(user.getId()).email(user.getEmail()).fullName(user.getFullName()).build();
    }
}
