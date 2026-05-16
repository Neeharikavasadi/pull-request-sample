package com.example.RetailOrderingWebsite.service;

import com.example.RetailOrderingWebsite.dto.AuthRequest;
import com.example.RetailOrderingWebsite.dto.AuthResponse;
import com.example.RetailOrderingWebsite.dto.RegisterRequest;
import com.example.RetailOrderingWebsite.model.User;
import com.example.RetailOrderingWebsite.repository.UserRepository;
import com.example.RetailOrderingWebsite.security.CustomUserDetails;
import com.example.RetailOrderingWebsite.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        User user = new User(request.getUsername(), request.getEmail(), passwordEncoder.encode(request.getPassword()));
        if ("admin".equalsIgnoreCase(request.getUsername())) {
            user.setRole("ROLE_ADMIN");
        }
        user = userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(user.getId(), user.getUsername(), "Registration successful", token, user.getLoyaltyPoints(), user.getRole());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        User user = userDetails.getUser();
        return new AuthResponse(user.getId(), user.getUsername(), "Login successful", token, user.getLoyaltyPoints(), user.getRole());
    }

    @Transactional(readOnly = true)
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
