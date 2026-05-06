package com.example.dbms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory_receipt_details")
public class InventoryReceiptDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id")
    private InventoryReceipt receipt;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;
    private Integer quantity;
    @Column(name = "unit_price")
    private Integer unitPrice;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public InventoryReceipt getReceipt() { return receipt; }
    public void setReceipt(InventoryReceipt receipt) { this.receipt = receipt; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Integer unitPrice) { this.unitPrice = unitPrice; }
}
