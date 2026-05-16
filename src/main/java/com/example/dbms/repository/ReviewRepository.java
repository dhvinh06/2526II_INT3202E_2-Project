package com.example.dbms.repository;

import com.example.dbms.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, String> {
    @org.springframework.data.jpa.repository.Query("select r from Review r join fetch r.user where r.product.id = :productId")
    List<Review> findByProductId(@org.springframework.data.repository.query.Param("productId") Integer productId);

    Optional<Review> findByProductIdAndUserId(Integer productId, Integer userId);
}
