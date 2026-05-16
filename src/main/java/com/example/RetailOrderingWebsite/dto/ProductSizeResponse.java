package com.example.RetailOrderingWebsite.dto;

import java.math.BigDecimal;

public class ProductSizeResponse {

    private Long id;
    private String size;
    private BigDecimal price;

    public ProductSizeResponse() {
    }

    public ProductSizeResponse(Long id, String size, BigDecimal price) {
        this.id = id;
        this.size = size;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}
