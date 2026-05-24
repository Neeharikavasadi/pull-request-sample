package com.example.RetailOrderingWebsite.repository;

import com.example.RetailOrderingWebsite.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
