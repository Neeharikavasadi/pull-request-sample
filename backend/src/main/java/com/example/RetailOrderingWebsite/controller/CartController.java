package com.example.RetailOrderingWebsite.controller;

import com.example.RetailOrderingWebsite.dto.AddToCartRequest;
import com.example.RetailOrderingWebsite.dto.CartResponse;
import com.example.RetailOrderingWebsite.dto.MessageResponse;
import com.example.RetailOrderingWebsite.service.AuthorizationService;
import com.example.RetailOrderingWebsite.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final AuthorizationService authorizationService;

    public CartController(CartService cartService, AuthorizationService authorizationService) {
        this.cartService = cartService;
        this.authorizationService = authorizationService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request) {
        try {
            authorizationService.validateUserAccess(request.getUserId());
            authorizationService.validateCustomerAccess();
            CartResponse response = cartService.addToCart(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            authorizationService.validateUserAccess(userId);
            return ResponseEntity.ok(cartService.getCartByUserId(userId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    @DeleteMapping("/remove/{userId}/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long userId, @PathVariable Long itemId) {
        try {
            authorizationService.validateUserAccess(userId);
            return ResponseEntity.ok(cartService.removeItem(userId, itemId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    @PatchMapping("/quantity/{userId}/{itemId}")
    public ResponseEntity<?> updateItemQuantity(@PathVariable Long userId,
                                                @PathVariable Long itemId,
                                                @RequestParam Integer delta) {
        try {
            authorizationService.validateUserAccess(userId);
            return ResponseEntity.ok(cartService.updateItemQuantity(userId, itemId, delta));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }
}
