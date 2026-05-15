package com.example.dbms.service;

import com.example.dbms.dto.ReviewRequest;
import com.example.dbms.entity.Product;
import com.example.dbms.entity.Review;
import com.example.dbms.entity.User;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.ProductRepository;
import com.example.dbms.repository.ReviewRepository;
import com.example.dbms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> create(ReviewRequest req) {
        if (reviewRepository.findByProductIdAndUserId(req.getProductId(), req.getUserId()).isPresent()) {
            throw new ApiException(ErrorCode.VALIDATION_FAILED, HttpStatus.BAD_REQUEST, "Review already exists for this product/user");
        }
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "User not found"));
        Review r = new Review();
        r.setId(genId());
        r.setProduct(product);
        r.setUser(user);
        r.setRating(req.getRating());
        r.setComment(req.getComment());
        r.setCreatedAt(Instant.now());
        Review saved = reviewRepository.save(r);

        // Cập nhật lại rating trung bình của sản phẩm
        List<Review> allReviews = reviewRepository.findByProductId(req.getProductId());
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(0);
        product.setRating(BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP));
        productRepository.save(product);

        return toMap(saved);
    }

    public List<Map<String, Object>> byProduct(Integer productId) {
        return reviewRepository.findByProductId(productId).stream().map(this::toMap).toList();
    }

    private String genId() {
        return "RVW-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + (100 + random.nextInt(900));
    }

    private Map<String, Object> toMap(Review r) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", r.getId());
        m.put("productId", r.getProduct().getId());
        m.put("userId", r.getUser().getId());
        m.put("userName", r.getUser().getName());
        m.put("rating", r.getRating());
        m.put("comment", r.getComment());
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
