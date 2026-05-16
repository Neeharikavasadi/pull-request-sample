package com.example.RetailOrderingWebsite.controller;

import com.example.RetailOrderingWebsite.dto.CouponRequest;
import com.example.RetailOrderingWebsite.dto.CouponResponse;
import com.example.RetailOrderingWebsite.dto.MessageResponse;
import com.example.RetailOrderingWebsite.model.Coupon;
import com.example.RetailOrderingWebsite.service.AuthorizationService;
import com.example.RetailOrderingWebsite.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CouponController {

    private final CouponService couponService;
    private final AuthorizationService authorizationService;

    public CouponController(CouponService couponService, AuthorizationService authorizationService) {
        this.couponService = couponService;
        this.authorizationService = authorizationService;
    }

    // Public endpoint for users to validate coupon
    @GetMapping("/coupons/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code) {
        java.util.Optional<Coupon> couponOpt = couponService.getCouponByCode(code);
        if (couponOpt.isPresent() && couponService.isValid(couponOpt.get())) {
            return ResponseEntity.ok(mapToResponse(couponOpt.get()));
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired coupon code"));
    }

    @GetMapping("/coupons/active")
    public ResponseEntity<List<CouponResponse>> getActiveCoupons() {
        List<CouponResponse> activeCoupons = couponService.getAllCoupons().stream()
                .filter(couponService::isValid)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(activeCoupons);
    }

    // Admin endpoints
    @GetMapping("/admin/coupons")
    public ResponseEntity<?> getAllCoupons() {
        try {
            authorizationService.validateAdminAccess();
            List<CouponResponse> coupons = couponService.getAllCoupons().stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(coupons);
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<?> addCoupon(@Valid @RequestBody CouponRequest request) {
        try {
            authorizationService.validateAdminAccess();
            Coupon coupon = couponService.addCoupon(request);
            return ResponseEntity.ok(mapToResponse(coupon));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @PutMapping("/admin/coupons/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        try {
            authorizationService.validateAdminAccess();
            Coupon coupon = couponService.updateCoupon(id, request);
            return ResponseEntity.ok(mapToResponse(coupon));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        }
    }

    @DeleteMapping("/admin/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            authorizationService.validateAdminAccess();
            couponService.deleteCoupon(id);
            return ResponseEntity.ok(new MessageResponse("Coupon deleted successfully"));
        } catch (org.springframework.security.access.AccessDeniedException ex) {
            return ResponseEntity.status(403).body(new MessageResponse(ex.getMessage()));
        }
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountPercentage(),
                coupon.getExpiryDate(),
                coupon.getActive()
        );
    }
}
