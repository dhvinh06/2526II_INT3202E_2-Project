package com.example.dbms.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "inventory_receipts")
public class InventoryReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;
    @Column(name = "total_cost")
    private Integer totalCost;
    private String note;
    @Column(name = "created_at")
    private Instant createdAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public Integer getTotalCost() { return totalCost; }
    public void setTotalCost(Integer totalCost) { this.totalCost = totalCost; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
