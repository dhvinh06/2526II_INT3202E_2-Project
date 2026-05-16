package com.example.dbms.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "coupons")
@Getter
@Setter
public class Coupon {
    @Id
    private String id; // This is the coupon code
    
    @Column(name = "discount_percent")
    private Integer discountPercent;
    
    private Boolean active;
}
