package com.example.RetailOrderingWebsite.controller;

import com.example.RetailOrderingWebsite.dto.ProductRequest;
import com.example.RetailOrderingWebsite.dto.ProductResponse;
import com.example.RetailOrderingWebsite.dto.ProductSizeRequest;
import com.example.RetailOrderingWebsite.dto.ProductSizeResponse;
import com.example.RetailOrderingWebsite.model.Product;
import com.example.RetailOrderingWebsite.model.ProductSize;
import com.example.RetailOrderingWebsite.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;
    private final com.example.RetailOrderingWebsite.service.AuthorizationService authorizationService;

    public ProductController(ProductService productService, com.example.RetailOrderingWebsite.service.AuthorizationService authorizationService) {
        this.productService = productService;
        this.authorizationService = authorizationService;
    }

    @GetMapping("/products")
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/products/category/{categoryId}")
    public List<ProductResponse> getProductsByCategory(@PathVariable Long categoryId) {
        return productService.getProductsByCategory(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/products")
    public ResponseEntity<?> addProduct(@Valid @RequestBody ProductRequest request) {
        try {
            authorizationService.validateAdminAccess();
            Product product = productService.addProduct(request);
            return ResponseEntity.ok(mapToResponse(product));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        }
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long productId, @Valid @RequestBody ProductRequest request) {
        try {
            authorizationService.validateAdminAccess();
            Product product = productService.updateProduct(productId, request);
            return ResponseEntity.ok(mapToResponse(product));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        }
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long productId) {
        try {
            authorizationService.validateAdminAccess();
            productService.deleteProduct(productId);
            return ResponseEntity.ok(new com.example.RetailOrderingWebsite.dto.MessageResponse("Product deleted successfully"));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(409).body(new com.example.RetailOrderingWebsite.dto.MessageResponse("Cannot delete this product because it is part of existing orders."));
        }
    }

    @GetMapping("/products/available")
    public List<ProductResponse> getAvailableProducts() {
        return productService.getAvailableProducts().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/products/search")
    public List<ProductResponse> searchProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice) {
        return productService.searchProducts(name, categoryId, minPrice, maxPrice).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @PostMapping("/products/{productId}/image")
    public ResponseEntity<?> uploadImage(@PathVariable Long productId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            authorizationService.validateAdminAccess();
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse("File is empty"));
            }
            
            String uploadDir = "uploads/";
            java.io.File directory = new java.io.File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + filename);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            String fileUrl = "/uploads/" + filename;
            
            // Get product and update it without needing full request
            Product product = productService.getProductById(productId);
            product.setImageUrl(fileUrl);
            
            // Re-save via repository is better, but since we don't have access to repo here, 
            // we create a helper or just do it via service. Let's add a quick save method to service or just 
            // do a simple trick: we can create a product request from existing and update it.
            ProductRequest request = new ProductRequest();
            request.setName(product.getName());
            request.setDescription(product.getDescription());
            request.setPrice(product.getPrice());
            request.setCategoryId(product.getCategory().getId());
            request.setBrand(product.getBrand());
            request.setPackaging(product.getPackaging());
            request.setStockQuantity(product.getStockQuantity());
            request.setImageUrl(fileUrl);
            
            product = productService.updateProduct(productId, request);
            
            return ResponseEntity.ok(mapToResponse(product));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(new com.example.RetailOrderingWebsite.dto.MessageResponse("Error uploading file: " + ex.getMessage()));
        }
    }

    @PatchMapping("/products/{productId}/stock")
    public ResponseEntity<?> addStock(@PathVariable Long productId, @RequestBody java.util.Map<String, Integer> request) {
        try {
            authorizationService.validateAdminAccess();
            Integer quantity = request.get("quantity");
            Product product = productService.addStock(productId, quantity);
            return ResponseEntity.ok(mapToResponse(product));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        }
    }

    // Product Size Management Endpoints
    @GetMapping("/products/{productId}/sizes")
    public ResponseEntity<?> getProductSizes(@PathVariable Long productId) {
        try {
            List<ProductSize> sizes = productService.getProductSizes(productId);
            List<ProductSizeResponse> sizeResponses = sizes.stream()
                    .map(size -> new ProductSizeResponse(size.getId(), size.getSize(), size.getPrice()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(sizeResponses);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/products/{productId}/sizes")
    public ResponseEntity<?> addProductSize(@PathVariable Long productId, @Valid @RequestBody ProductSizeRequest request) {
        try {
            authorizationService.validateAdminAccess();
            ProductSize size = productService.addProductSize(productId, request);
            ProductSizeResponse response = new ProductSizeResponse(size.getId(), size.getSize(), size.getPrice());
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        }
    }

    @PutMapping("/products/sizes/{sizeId}")
    public ResponseEntity<?> updateProductSize(@PathVariable Long sizeId, @Valid @RequestBody ProductSizeRequest request) {
        try {
            authorizationService.validateAdminAccess();
            ProductSize size = productService.updateProductSize(sizeId, request);
            ProductSizeResponse response = new ProductSizeResponse(size.getId(), size.getSize(), size.getPrice());
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        }
    }

    @DeleteMapping("/products/sizes/{sizeId}")
    public ResponseEntity<?> deleteProductSize(@PathVariable Long sizeId) {
        try {
            authorizationService.validateAdminAccess();
            productService.deleteProductSize(sizeId);
            return ResponseEntity.ok(new com.example.RetailOrderingWebsite.dto.MessageResponse("Product size deleted successfully"));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new com.example.RetailOrderingWebsite.dto.MessageResponse(ex.getMessage()));
        }
    }

    private ProductResponse mapToResponse(Product product) {
        List<ProductSizeResponse> sizeResponses = product.getSizes() != null ?
                product.getSizes().stream()
                        .map(size -> new ProductSizeResponse(size.getId(), size.getSize(), size.getPrice()))
                        .collect(Collectors.toList())
                : List.of();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory() != null ? product.getCategory().getName() : "",
                product.getBrand(),
                product.getPackaging(),
                product.getStockQuantity(),
                product.getImageUrl(),
                sizeResponses
        );
    }
}
