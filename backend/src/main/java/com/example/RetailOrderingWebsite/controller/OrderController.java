package com.example.RetailOrderingWebsite.controller;

import com.example.RetailOrderingWebsite.dto.MessageResponse;
import com.example.RetailOrderingWebsite.dto.OrderResponse;
import com.example.RetailOrderingWebsite.service.AuthorizationService;
import com.example.RetailOrderingWebsite.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthorizationService authorizationService;

    public OrderController(OrderService orderService, AuthorizationService authorizationService) {
        this.orderService = orderService;
        this.authorizationService = authorizationService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> placeOrder(@PathVariable Long userId, @RequestBody(required = false) com.example.RetailOrderingWebsite.dto.PlaceOrderRequest request) {
        try {
            authorizationService.validateUserAccess(userId);
            authorizationService.validateCustomerAccess();
            java.math.BigDecimal total = request != null ? request.getTotalAmount() : null;
            Integer points = request != null ? request.getPointsRedeemed() : 0;
            OrderResponse response = orderService.placeOrder(userId, total, points);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getOrders(@PathVariable Long userId) {
        try {
            authorizationService.validateUserAccess(userId);
            List<OrderResponse> responses = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(responses);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    @PatchMapping("/{userId}/{orderId}/receive")
    public ResponseEntity<?> markReceived(@PathVariable Long userId, @PathVariable Long orderId) {
        try {
            authorizationService.validateUserAccess(userId);
            OrderResponse response = orderService.markOrderReceived(userId, orderId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getAllOrders() {
        try {
            authorizationService.validateAdminAccess();
            List<OrderResponse> responses = orderService.getAllOrders();
            return ResponseEntity.ok(responses);
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }
}
