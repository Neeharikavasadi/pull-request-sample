package com.example.RetailOrderingWebsite.service;

import com.example.RetailOrderingWebsite.dto.OrderItemResponse;
import com.example.RetailOrderingWebsite.dto.OrderResponse;
import com.example.RetailOrderingWebsite.model.Cart;
import com.example.RetailOrderingWebsite.model.CartItem;
import com.example.RetailOrderingWebsite.model.Order;
import com.example.RetailOrderingWebsite.model.OrderItem;
import com.example.RetailOrderingWebsite.model.User;
import com.example.RetailOrderingWebsite.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserService userService;
    private final CartService cartService;
    private final EmailService emailService;
    private final com.example.RetailOrderingWebsite.repository.ProductRepository productRepository;
    private final com.example.RetailOrderingWebsite.repository.UserRepository userRepository;
    private final com.example.RetailOrderingWebsite.repository.ProductSizeRepository productSizeRepository;

    public OrderService(OrderRepository orderRepository, UserService userService, CartService cartService, EmailService emailService, com.example.RetailOrderingWebsite.repository.ProductRepository productRepository, com.example.RetailOrderingWebsite.repository.UserRepository userRepository, com.example.RetailOrderingWebsite.repository.ProductSizeRepository productSizeRepository) {
        this.orderRepository = orderRepository;
        this.userService = userService;
        this.cartService = cartService;
        this.emailService = emailService;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productSizeRepository = productSizeRepository;
    }

    @Transactional
    public OrderResponse placeOrder(Long userId, BigDecimal discountedTotal, Integer pointsRedeemed) {
        User user = userService.getUserById(userId);
        Cart cart = user.getCart();
        if (cart == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        if (pointsRedeemed != null && pointsRedeemed > 0) {
            if (user.getLoyaltyPoints() < pointsRedeemed) {
                throw new IllegalArgumentException("Insufficient loyalty points");
            }
            user.setLoyaltyPoints(user.getLoyaltyPoints() - pointsRedeemed);
        }

        BigDecimal total = discountedTotal != null ? discountedTotal : BigDecimal.ZERO;
        Order order = new Order(user, LocalDateTime.now(), total);
        order.setStatus("PLACED");
        StringBuilder emailDetails = new StringBuilder("Thank you for your order!\n\nOrder Details:\n");

        BigDecimal calculatedTotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            com.example.RetailOrderingWebsite.model.Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for " + product.getName());
            }
        }

        for (CartItem cartItem : cart.getItems()) {
            com.example.RetailOrderingWebsite.model.Product product = cartItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal itemPrice = cartItem.getPrice() != null ? cartItem.getPrice() : product.getPrice();
            BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            calculatedTotal = calculatedTotal.add(itemTotal);
            
            String productName = product.getName();
            if (cartItem.getSizeId() != null) {
                productName += productSizeRepository.findById(cartItem.getSizeId())
                        .map(size -> " (" + size.getSize() + ")")
                        .orElse("");
            }

            OrderItem orderItem = new OrderItem(
                    order,
                    product,
                    cartItem.getQuantity(),
                    itemPrice,
                    productName
            );
            order.getItems().add(orderItem);
            
            emailDetails.append("- ").append(cartItem.getQuantity()).append("x ").append(productName).append("\n");
        }

        if (discountedTotal == null) {
            order.setTotalAmount(calculatedTotal);
            total = calculatedTotal;
        }

        order = orderRepository.save(order);
        cartService.clearCart(cart);

        // Award Loyalty Points (1 point for every $10 spent)
        int pointsEarned = total.divide(BigDecimal.TEN, java.math.RoundingMode.DOWN).intValue();
        if (user.getLoyaltyPoints() == null) {
            user.setLoyaltyPoints(0);
        }
        user.setLoyaltyPoints(user.getLoyaltyPoints() + pointsEarned);
        userRepository.save(user);

        emailDetails.append("\nTotal: ₹").append(total);
        emailDetails.append("\nYou earned ").append(pointsEarned).append(" loyalty points!");

        // Send Email asynchronously (simulated)
        final Long oId = order.getId();
        final String details = emailDetails.toString();
        final String email = user.getEmail();
        new Thread(() -> emailService.sendOrderConfirmation(email, oId, details)).start();

        return buildOrderResponse(order, user.getLoyaltyPoints());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        User user = userService.getUserById(userId);
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .map(order -> buildOrderResponse(order, user.getLoyaltyPoints()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(order -> buildOrderResponse(order, order.getUser().getLoyaltyPoints()))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse markOrderReceived(Long userId, Long orderId) {
        User user = userService.getUserById(userId);
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if ("DELIVERED".equals(order.getStatus())) {
            return buildOrderResponse(order, user.getLoyaltyPoints());
        }

        order.setStatus("DELIVERED");
        order.setDeliveredAt(LocalDateTime.now());
        order = orderRepository.save(order);
        return buildOrderResponse(order, user.getLoyaltyPoints());
    }

    private OrderResponse buildOrderResponse(Order order, Integer loyaltyPoints) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getProduct().getId(),
                        item.getProductName(),
                        item.getQuantity(),
                        item.getPrice(),
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                ))
                .collect(Collectors.toList());
        return new OrderResponse(
                order.getId(),
                order.getOrderDate(),
                order.getTotalAmount(),
                items,
                loyaltyPoints,
                order.getStatus(),
                order.getDeliveredAt(),
                order.getUser().getUsername()
        );
    }
}
