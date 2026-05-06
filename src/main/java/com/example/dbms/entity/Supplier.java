package com.example.dbms.entity;

import jakarta.persistence.*;

import java.time.Instant;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    @Column(name = "contact_name")
    private String contactName;
    private String phone;
    private String email;
    private String address;
    @Column(name = "created_at")
    private Instant createdAt;
}
