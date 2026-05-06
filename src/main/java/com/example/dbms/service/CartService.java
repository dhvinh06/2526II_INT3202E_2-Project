package com.example.dbms.service;

import com.example.dbms.dto.CartItemUpsertRequest;
import com.example.dbms.dto.UpdateQuantityRequest;
import com.example.dbms.entity.CartItem;
import com.example.dbms.entity.Product;
import com.example.dbms.entity.User;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.CartItemRepository;
import com.example.dbms.repository.ProductRepository;
import com.example.dbms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<Map<String, Object>> listByUser(Integer userId) {
        return cartItemRepository.findByUserId(userId).stream().map(this::toMap).toList();
    }

    public Map<String, Object> upsert(CartItemUpsertRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "User not found"));
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
        CartItem item = cartItemRepository.findByUserIdAndProductId(req.getUserId(), req.getProductId()).orElseGet(CartItem::new);
        item.setUser(user);
        item.setProduct(product);
        item.setQuantity(req.getQuantity());
        item.setName(product.getName());
        item.setPrice(product.getPrice());
        item.setImage(product.getImage());
        return toMap(cartItemRepository.save(item));
    }

    public Map<String, Object> updateQuantity(Integer id, UpdateQuantityRequest req) {
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Cart item not found"));
        if (req.getQuantity() == 0) {
            cartItemRepository.delete(item);
            return Map.of("deleted", true, "id", id);
        }
        item.setQuantity(req.getQuantity());
        return toMap(cartItemRepository.save(item));
    }

    public void delete(Integer id) {
        cartItemRepository.deleteById(id);
    }

    private Map<String, Object> toMap(CartItem item) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", item.getId());
        m.put("userId", item.getUser().getId());
        m.put("productId", item.getProduct().getId());
        m.put("name", item.getName());
        m.put("price", item.getPrice());
        m.put("image", item.getImage());
        m.put("quantity", item.getQuantity());
        return m;
    }
}
