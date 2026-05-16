package com.example.RetailOrderingWebsite.dto;

import java.math.BigDecimal;

public class PlaceOrderRequest {
    private BigDecimal totalAmount;
    private Integer pointsRedeemed;

    public PlaceOrderRequest() {}

    public PlaceOrderRequest(BigDecimal totalAmount, Integer pointsRedeemed) {
        this.totalAmount = totalAmount;
        this.pointsRedeemed = pointsRedeemed;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getPointsRedeemed() {
        return pointsRedeemed;
    }

    public void setPointsRedeemed(Integer pointsRedeemed) {
        this.pointsRedeemed = pointsRedeemed;
    }
}
