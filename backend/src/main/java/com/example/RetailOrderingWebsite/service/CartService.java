package com.example.RetailOrderingWebsite.service;

import com.example.RetailOrderingWebsite.dto.AddToCartRequest;
import com.example.RetailOrderingWebsite.dto.CartItemResponse;
import com.example.RetailOrderingWebsite.dto.CartResponse;
import com.example.RetailOrderingWebsite.model.Cart;
import com.example.RetailOrderingWebsite.model.CartItem;
import com.example.RetailOrderingWebsite.model.Product;
import com.example.RetailOrderingWebsite.model.ProductSize;
import com.example.RetailOrderingWebsite.model.User;
import com.example.RetailOrderingWebsite.repository.CartItemRepository;
import com.example.RetailOrderingWebsite.repository.CartRepository;
import com.example.RetailOrderingWebsite.repository.ProductSizeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final ProductService productService;
    private final ProductSizeRepository productSizeRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       UserService userService,
                       ProductService productService,
                       ProductSizeRepository productSizeRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userService = userService;
        this.productService = productService;
        this.productSizeRepository = productSizeRepository;
    }

    @Transactional
    public CartResponse addToCart(AddToCartRequest request) {
        User user = userService.getUserById(request.getUserId());
        Product product = productService.getProductById(request.getProductId());

        Cart cart = cartRepository.findByUserId(user.getId()).orElseGet(() -> createCartForUser(user));
        CartItem item = cart.getItems().stream()
                .filter(cartItem -> cartItem.getProduct().getId().equals(product.getId())
                                    && (request.getSizeId() == null ? cartItem.getSizeId() == null : request.getSizeId().equals(cartItem.getSizeId())))
                .findFirst()
                .orElse(null);

        if (item == null) {
            if (request.getSizeId() != null) {
                ProductSize size = productSizeRepository.findById(request.getSizeId())
                        .orElseThrow(() -> new IllegalArgumentException("Size not found"));
                if (request.getQuantity() > size.getQuantity()) {
                    throw new IllegalArgumentException("Requested quantity exceeds available size stock");
                }
            } else if (request.getQuantity() > product.getStockQuantity()) {
                throw new IllegalArgumentException("Requested quantity exceeds available stock");
            }
            BigDecimal price = product.getPrice();
            if (request.getSizeId() != null) {
                ProductSize size = productSizeRepository.findById(request.getSizeId())
                        .orElseThrow(() -> new IllegalArgumentException("Size not found"));
                price = size.getPrice();
            }
            item = new CartItem(cart, product, request.getQuantity(), request.getSizeId(), price);
            cart.getItems().add(item);
        } else {
            int updatedQuantity = item.getQuantity() + request.getQuantity();
            if (item.getSizeId() != null) {
                ProductSize size = productSizeRepository.findById(item.getSizeId())
                        .orElseThrow(() -> new IllegalArgumentException("Size not found"));
                if (updatedQuantity > size.getQuantity()) {
                    throw new IllegalArgumentException("Requested quantity exceeds available size stock");
                }
            } else if (updatedQuantity > product.getStockQuantity()) {
                throw new IllegalArgumentException("Requested quantity exceeds available stock");
            }
            item.setQuantity(updatedQuantity);
        }

        cart = cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createCartForUser(userService.getUserById(userId)));
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        CartItem item = cart.getItems().stream()
                .filter(cartItem -> cartItem.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cart = cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long cartItemId, Integer delta) {
        if (delta == null || delta == 0) {
            throw new IllegalArgumentException("Quantity change must be non-zero");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        CartItem item = cart.getItems().stream()
                .filter(cartItem -> cartItem.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        int updatedQuantity = item.getQuantity() + delta;
        if (item.getSizeId() != null) {
            ProductSize size = productSizeRepository.findById(item.getSizeId())
                    .orElseThrow(() -> new IllegalArgumentException("Size not found"));
            if (updatedQuantity > size.getQuantity()) {
                throw new IllegalArgumentException("Requested quantity exceeds available size stock");
            }
        } else if (updatedQuantity > item.getProduct().getStockQuantity()) {
            throw new IllegalArgumentException("Requested quantity exceeds available stock");
        }

        if (updatedQuantity <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(updatedQuantity);
        }

        cart = cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    private Cart createCartForUser(User user) {
        Cart cart = new Cart(user);
        user.setCart(cart);
        return cartRepository.save(cart);
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(item -> {
                    String sizeName = null;
                    if (item.getSizeId() != null) {
                        sizeName = productSizeRepository.findById(item.getSizeId())
                                .map(ProductSize::getSize)
                                .orElse(null);
                    }
                    BigDecimal price = item.getPrice() != null ? item.getPrice() : item.getProduct().getPrice();

                    return new CartItemResponse(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getQuantity(),
                            price,
                            price.multiply(BigDecimal.valueOf(item.getQuantity())),
                            item.getSizeId(),
                            sizeName
                    );
                })
                .collect(Collectors.toList());

        BigDecimal totalPrice = items.stream()
                .map(CartItemResponse::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, totalPrice);
    }
}
