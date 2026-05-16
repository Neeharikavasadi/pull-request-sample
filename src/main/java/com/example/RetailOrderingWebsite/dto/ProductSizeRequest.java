package com.example.RetailOrderingWebsite.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProductSizeRequest {

    private String size;
    private BigDecimal price;

    @NotNull
    @Min(0)
    private Integer quantity;

    public ProductSizeRequest() {
    }

    public ProductSizeRequest(String size, BigDecimal price, Integer quantity) {
        this.size = size;
        this.price = price;
        this.quantity = quantity;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
