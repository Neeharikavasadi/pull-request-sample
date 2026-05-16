package com.example.RetailOrderingWebsite.service;

import com.example.RetailOrderingWebsite.dto.ProductRequest;
import com.example.RetailOrderingWebsite.dto.ProductSizeRequest;
import com.example.RetailOrderingWebsite.model.Category;
import com.example.RetailOrderingWebsite.model.Product;
import com.example.RetailOrderingWebsite.model.ProductSize;
import com.example.RetailOrderingWebsite.repository.OrderItemRepository;
import com.example.RetailOrderingWebsite.repository.ProductRepository;
import com.example.RetailOrderingWebsite.repository.ProductSizeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final OrderItemRepository orderItemRepository;
    private final ProductSizeRepository productSizeRepository;

    public ProductService(ProductRepository productRepository, CategoryService categoryService, OrderItemRepository orderItemRepository, ProductSizeRepository productSizeRepository) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
        this.orderItemRepository = orderItemRepository;
        this.productSizeRepository = productSizeRepository;
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Product> getAvailableProducts() {
        return productRepository.findByStockQuantityGreaterThanAndActiveTrue(0);
    }

    @Transactional(readOnly = true)
    public List<Product> searchProducts(String name, Long categoryId, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice) {
        return productRepository.searchProducts(name, categoryId, minPrice, maxPrice);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    @Transactional
    public Product addProduct(ProductRequest request) {
        Category category = categoryService.getCategoryById(request.getCategoryId());
        Product product = new Product(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                category,
                request.getBrand(),
                request.getPackaging(),
                request.getStockQuantity()
        );
        product.setImageUrl(request.getImageUrl());
        final Product savedProduct = productRepository.save(product);
        
        // Add sizes if provided
        if (request.getSizes() != null && !request.getSizes().isEmpty()) {
            List<ProductSize> sizes = request.getSizes().stream()
                    .map(sizeReq -> new ProductSize(savedProduct, sizeReq.getSize(), sizeReq.getPrice()))
                    .collect(Collectors.toList());
            savedProduct.setSizes(productSizeRepository.saveAll(sizes));
        }
        
        return savedProduct;
    }

    @Transactional
    public Product updateProduct(Long productId, ProductRequest request) {
        Product product = getProductById(productId);
        Category category = categoryService.getCategoryById(request.getCategoryId());
        
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setPackaging(request.getPackaging());
        product.setStockQuantity(request.getStockQuantity());
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        
        // Update sizes if provided
        if (request.getSizes() != null) {
            product.getSizes().clear();
            if (!request.getSizes().isEmpty()) {
                List<ProductSize> newSizes = request.getSizes().stream()
                        .map(sizeReq -> new ProductSize(product, sizeReq.getSize(), sizeReq.getPrice()))
                        .collect(Collectors.toList());
                product.getSizes().addAll(newSizes);
            }
        }
        
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        Product product = getProductById(productId);
        if (orderItemRepository.existsByProductId(productId)) {
            product.setActive(false);
            productRepository.save(product);
        } else {
            productRepository.delete(product);
        }
    }

    @Transactional
    public Product addStock(Long productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        Product product = getProductById(productId);
        product.setStockQuantity(product.getStockQuantity() + quantity);
        return productRepository.save(product);
    }

    @Transactional
    public ProductSize addProductSize(Long productId, ProductSizeRequest request) {
        Product product = getProductById(productId);
        ProductSize size = new ProductSize(product, request.getSize(), request.getPrice());
        return productSizeRepository.save(size);
    }

    @Transactional
    public ProductSize updateProductSize(Long sizeId, ProductSizeRequest request) {
        ProductSize size = productSizeRepository.findById(sizeId)
                .orElseThrow(() -> new IllegalArgumentException("Product size not found"));
        size.setSize(request.getSize());
        size.setPrice(request.getPrice());
        return productSizeRepository.save(size);
    }

    @Transactional
    public void deleteProductSize(Long sizeId) {
        if (!productSizeRepository.existsById(sizeId)) {
            throw new IllegalArgumentException("Product size not found");
        }
        productSizeRepository.deleteById(sizeId);
    }

    @Transactional(readOnly = true)
    public List<ProductSize> getProductSizes(Long productId) {
        return productSizeRepository.findByProductId(productId);
    }
}
