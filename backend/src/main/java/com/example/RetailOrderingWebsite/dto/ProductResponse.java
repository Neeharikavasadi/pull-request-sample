package com.example.RetailOrderingWebsite.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String brand;
    private String packaging;
    private Integer stockQuantity;
    private String imageUrl;
    private List<ProductSizeResponse> sizes;

    public ProductResponse() {
    }

    public ProductResponse(Long id, String name, String description, BigDecimal price, String category, String brand, String packaging, Integer stockQuantity, String imageUrl, List<ProductSizeResponse> sizes) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.brand = brand;
        this.packaging = packaging;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.sizes = sizes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getPackaging() {
        return packaging;
    }

    public void setPackaging(String packaging) {
        this.packaging = packaging;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<ProductSizeResponse> getSizes() {
        return sizes;
    }

    public void setSizes(List<ProductSizeResponse> sizes) {
        this.sizes = sizes;
    }
}
