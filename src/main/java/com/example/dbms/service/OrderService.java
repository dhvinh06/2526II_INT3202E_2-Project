package com.example.dbms.service;

import com.example.dbms.dto.CheckoutRequest;
import com.example.dbms.entity.*;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShippingAddressService shippingAddressService;
    private final Random random = new Random();

    public OrderService(UserRepository userRepository, CartItemRepository cartItemRepository, ProductRepository productRepository, OrderRepository orderRepository, OrderItemRepository orderItemRepository, ShippingAddressService shippingAddressService) {
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.shippingAddressService = shippingAddressService;
    }

    @Transactional
    public Map<String, Object> checkout(Integer userId, CheckoutRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "User not found"));
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new ApiException(ErrorCode.EMPTY_CART, HttpStatus.BAD_REQUEST, "Cart is empty");
        }
        ShippingAddress shippingAddress = shippingAddressService
                .validateForCheckout(userId, req != null ? req.getShippingAddressId() : null, req != null ? req.getNewAddress() : null);

        List<Integer> productIds = cartItems.stream().map(ci -> ci.getProduct().getId()).distinct().toList();
        Map<Integer, Product> lockMap = new HashMap<>();
        for (Product p : productRepository.findAllByIdInForUpdate(productIds)) {
            lockMap.put(p.getId(), p);
        }

        int total = 0;
        for (CartItem ci : cartItems) {
            Product p = lockMap.get(ci.getProduct().getId());
            if (p == null) {
                throw new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found during checkout");
            }
            if (p.getStock() < ci.getQuantity()) {
                throw new ApiException(ErrorCode.INSUFFICIENT_STOCK, HttpStatus.BAD_REQUEST, "Insufficient stock for product " + p.getId());
            }
            total += p.getPrice() * ci.getQuantity();
        }

        Order order = new Order();
        order.setId(generateOrderId());
        order.setUser(user);
        order.setStatus("PENDING");
        order.setTotalAmount(total);
        order = orderRepository.save(order);

        List<OrderItem> savedItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            Product p = lockMap.get(ci.getProduct().getId());
            p.setStock(p.getStock() - ci.getQuantity());
            p.setSold(p.getSold() + ci.getQuantity());
            productRepository.save(p);
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProductId(String.valueOf(p.getId()));
            oi.setName(ci.getName());
            oi.setPrice(ci.getPrice());
            oi.setImage(ci.getImage());
            oi.setQuantity(ci.getQuantity());
            savedItems.add(orderItemRepository.save(oi));
        }

        cartItemRepository.deleteByUserId(userId);

        Map<String, Object> result = CommonMapper.order(order);
        result.put("shippingAddressId", shippingAddress.getId());
        result.put("items", savedItems.stream().map(i -> Map.of(
                "id", i.getId(),
                "productId", i.getProductId(),
                "name", i.getName(),
                "price", i.getPrice(),
                "quantity", i.getQuantity())).toList());
        return result;
    }

    public Map<String, Object> getById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Order not found"));
        Map<String, Object> data = CommonMapper.order(order);
        data.put("items", orderItemRepository.findByOrderId(orderId).stream().map(i -> Map.of(
                "id", i.getId(), "productId", i.getProductId(), "name", i.getName(), "price", i.getPrice(), "quantity", i.getQuantity()
        )).toList());
        return data;
    }

    public List<Map<String, Object>> byUser(Integer userId) {
        return orderRepository.findByUserId(userId).stream().map(CommonMapper::order).toList();
    }

    public List<Map<String, Object>> all(String status) {
        return orderRepository.findAll().stream()
                .filter(o -> status == null || status.equalsIgnoreCase(o.getStatus()))
                .map(CommonMapper::order).toList();
    }

    public Map<String, Object> updateStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Order not found"));
        order.setStatus(status);
        return CommonMapper.order(orderRepository.save(order));
    }

    private String generateOrderId() {
        String prefix = "ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + "-";
        String id;
        do {
            id = prefix + String.format("%03d", random.nextInt(1000));
        } while (orderRepository.existsById(id));
        return id;
    }
}
