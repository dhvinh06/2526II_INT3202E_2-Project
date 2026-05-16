package com.example.dbms.controller;

import com.example.dbms.dto.*;
import com.example.dbms.repository.BrandRepository;
import com.example.dbms.repository.CategoryRepository;
import com.example.dbms.service.*;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CustomerController {
    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final CartService cartService;
    private final OrderService orderService;
    private final ShippingAddressService shippingAddressService;
    private final ReviewService reviewService;

    public CustomerController(ProductService productService, CategoryRepository categoryRepository, BrandRepository brandRepository, CartService cartService, OrderService orderService, ShippingAddressService shippingAddressService, ReviewService reviewService) {
        this.productService = productService;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.cartService = cartService;
        this.orderService = orderService;
        this.shippingAddressService = shippingAddressService;
        this.reviewService = reviewService;
    }

    @GetMapping("/products")
    public List<Map<String, Object>> products(@RequestParam(required = false) Integer categoryId, @RequestParam(required = false) Integer brandId, @RequestParam(required = false) String search,
                                              @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "100") int size) {
        return productService.browse(categoryId, brandId, search, page, size);
    }

    @GetMapping("/products/{id}")
    public Map<String, Object> product(@PathVariable Integer id) {
        return productService.get(id);
    }

    @GetMapping("/products/seller/{sellerId}")
    public List<Map<String, Object>> productsBySeller(@PathVariable Integer sellerId, @RequestParam(required = false) String search) {
        return productService.getBySeller(sellerId, search);
    }

    @GetMapping("/categories")
    public List<?> categories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/brands")
    public List<?> brands() {
        return brandRepository.findAll();
    }

    @GetMapping("/cart-items/user/{userId}")
    public List<Map<String, Object>> cart(@PathVariable Integer userId) {
        return cartService.listByUser(userId);
    }

    @PostMapping("/cart-items")
    public Map<String, Object> upsert(@Valid @RequestBody CartItemUpsertRequest req) {
        return cartService.upsert(req);
    }

    @PutMapping("/cart-items/{id}")
    public Map<String, Object> updateCart(@PathVariable Integer id, @Valid @RequestBody UpdateQuantityRequest req) {
        return cartService.updateQuantity(id, req);
    }

    @DeleteMapping("/cart-items/{id}")
    public void deleteCart(@PathVariable Integer id) {
        cartService.delete(id);
    }

    @PostMapping("/orders/checkout/{userId}")
    public Map<String, Object> checkout(@PathVariable Integer userId, @RequestBody(required = false) CheckoutRequest req) {
        return orderService.checkout(userId, req);
    }

    @PostMapping("/orders/check-coupon/{userId}")
    public Map<String, Object> checkCoupon(@PathVariable Integer userId, @RequestBody Map<String, String> req) {
        return orderService.checkCoupon(userId, req.get("code"));
    }

    @GetMapping("/orders/{orderId}")
    public Map<String, Object> order(@PathVariable String orderId) {
        return orderService.getById(orderId);
    }

    @GetMapping("/orders/user/{userId}")
    public List<Map<String, Object>> orderByUser(@PathVariable Integer userId) {
        return orderService.byUser(userId);
    }

    @GetMapping("/shipping-addresses/user/{userId}")
    public List<Map<String, Object>> addresses(@PathVariable Integer userId) {
        return shippingAddressService.listByUser(userId);
    }

    @PostMapping("/shipping-addresses")
    public Map<String, Object> addAddress(@Valid @RequestBody ShippingAddressRequest req) {
        return shippingAddressService.create(req);
    }

    @PutMapping("/shipping-addresses/{id}")
    public Map<String, Object> updateAddress(@PathVariable Integer id, @Valid @RequestBody ShippingAddressRequest req) {
        return shippingAddressService.update(id, req);
    }

    @DeleteMapping("/shipping-addresses/{id}")
    public void deleteAddress(@PathVariable Integer id) {
        shippingAddressService.delete(id);
    }

    @PostMapping("/reviews")
    public Map<String, Object> addReview(@Valid @RequestBody ReviewRequest req) {
        return reviewService.create(req);
    }

    @GetMapping("/reviews/product/{productId}")
    public List<Map<String, Object>> reviews(@PathVariable Integer productId) {
        return reviewService.byProduct(productId);
    }

    @DeleteMapping("/reviews/{id}")
    public void deleteReview(@PathVariable String id, @RequestParam Integer userId) {
        reviewService.delete(id, userId);
    }

    @PutMapping("/products/{id}/stock")
    public void updateProductStock(@PathVariable Integer id, @RequestBody Map<String, Integer> req) {
        productService.updateStock(id, req.get("quantityChange"), req.get("userId"));
    }
}
