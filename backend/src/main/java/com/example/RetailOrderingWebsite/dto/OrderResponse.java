package com.example.RetailOrderingWebsite.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
    private Integer updatedLoyaltyPoints;
    private String status;
    private LocalDateTime deliveredAt;
    private String username;

    public OrderResponse() {
    }

    public OrderResponse(Long id, LocalDateTime orderDate, BigDecimal totalAmount, List<OrderItemResponse> items, Integer updatedLoyaltyPoints, String status, LocalDateTime deliveredAt, String username) {
        this.id = id;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.items = items;
        this.updatedLoyaltyPoints = updatedLoyaltyPoints;
        this.status = status;
        this.deliveredAt = deliveredAt;
        this.username = username;
    }

    public Integer getUpdatedLoyaltyPoints() {
        return updatedLoyaltyPoints;
    }

    public void setUpdatedLoyaltyPoints(Integer updatedLoyaltyPoints) {
        this.updatedLoyaltyPoints = updatedLoyaltyPoints;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
