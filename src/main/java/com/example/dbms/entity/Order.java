package com.example.dbms.entity;

import jakarta.persistence.*;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {
    @Id
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "total_amount")
    private Integer totalAmount;
    private String status;
    @Column(name = "created_at")
    private Instant createdAt;
    
    @Column(name = "discount_amount")
    private Integer discountAmount;
    
    @Column(name = "coupon_code")
    private String couponCode;
}
