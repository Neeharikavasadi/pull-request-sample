package com.example.RetailOrderingWebsite.repository;

import com.example.RetailOrderingWebsite.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();

    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    
    List<Product> findByStockQuantityGreaterThanAndActiveTrue(Integer quantity);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.active = true AND " +
            "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Product> searchProducts(@org.springframework.data.repository.query.Param("name") String name,
                                 @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
                                 @org.springframework.data.repository.query.Param("minPrice") java.math.BigDecimal minPrice,
                                 @org.springframework.data.repository.query.Param("maxPrice") java.math.BigDecimal maxPrice);

    boolean existsByCategoryId(Long categoryId);
}
