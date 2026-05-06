package com.example.dbms.repository;

import com.example.dbms.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByProductId(Integer productId);
    Optional<Review> findByProductIdAndUserId(Integer productId, Integer userId);
}
