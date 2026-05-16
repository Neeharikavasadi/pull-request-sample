package com.example.RetailOrderingWebsite.dto;

import java.math.BigDecimal;

public class ProductSizeRequest {

    private String size;
    private BigDecimal price;

    public ProductSizeRequest() {
    }

    public ProductSizeRequest(String size, BigDecimal price) {
        this.size = size;
        this.price = price;
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
