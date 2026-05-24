package com.example.RetailOrderingWebsite.dto;

public class AuthResponse {

    private Long userId;
    private String username;
    private String message;
    private String token;
    private Integer loyaltyPoints;
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(Long userId, String username, String message, String token, Integer loyaltyPoints, String role) {
        this.userId = userId;
        this.username = username;
        this.message = message;
        this.token = token;
        this.loyaltyPoints = loyaltyPoints;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Integer getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(Integer loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
