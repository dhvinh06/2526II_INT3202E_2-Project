package com.example.dbms.entity;

import jakarta.persistence.*;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "shipping_addresses")
@Getter
@Setter
public class ShippingAddress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "receiver_name")
    private String receiverName;
    private String phone;
    private String address;
    @Column(name = "is_default")
    private Boolean isDefault;
    @Column(name = "created_at")
    private Instant createdAt;
}
