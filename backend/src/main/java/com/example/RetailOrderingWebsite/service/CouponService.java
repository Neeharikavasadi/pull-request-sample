package com.example.RetailOrderingWebsite.service;

import com.example.RetailOrderingWebsite.dto.CouponRequest;
import com.example.RetailOrderingWebsite.model.Coupon;
import com.example.RetailOrderingWebsite.repository.CouponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Optional<Coupon> getCouponByCode(String code) {
        return couponRepository.findByCode(code.toUpperCase());
    }

    @Transactional
    public Coupon addCoupon(CouponRequest request) {
        if (couponRepository.findByCode(request.getCode().toUpperCase()).isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists");
        }
        Coupon coupon = new Coupon();
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setDiscountPercentage(request.getDiscountPercentage());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setActive(request.getActive());
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));

        // Check if code is being changed and if new code already exists
        String newCode = request.getCode().toUpperCase();
        if (!coupon.getCode().equals(newCode)) {
            if (couponRepository.findByCode(newCode).isPresent()) {
                throw new IllegalArgumentException("Coupon code already exists");
            }
        }

        coupon.setCode(newCode);
        coupon.setDiscountPercentage(request.getDiscountPercentage());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setActive(request.getActive());
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    public boolean isValid(Coupon coupon) {
        if (coupon == null || !coupon.getActive()) {
            return false;
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }
        return true;
    }
}
