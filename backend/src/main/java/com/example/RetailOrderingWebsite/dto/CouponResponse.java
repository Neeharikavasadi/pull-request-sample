package com.example.RetailOrderingWebsite.dto;

import java.time.LocalDateTime;

public class CouponResponse {
    private Long id;
    private String code;
    private Integer discountPercentage;
    private LocalDateTime expiryDate;
    private Boolean active;

    public CouponResponse() {}

    public CouponResponse(Long id, String code, Integer discountPercentage, LocalDateTime expiryDate, Boolean active) {
        this.id = id;
        this.code = code;
        this.discountPercentage = discountPercentage;
        this.expiryDate = expiryDate;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
