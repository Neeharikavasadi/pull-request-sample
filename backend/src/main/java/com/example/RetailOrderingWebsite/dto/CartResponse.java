package com.example.RetailOrderingWebsite.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {

    private List<CartItemResponse> items;
    private BigDecimal totalPrice;

    public CartResponse() {
    }

    public CartResponse(List<CartItemResponse> items, BigDecimal totalPrice) {
        this.items = items;
        this.totalPrice = totalPrice;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}
