package com.example.dbms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class InventoryReceiptRequest {
    private Integer supplierId;
    private String note;
    @NotNull
    private List<InventoryReceiptItemRequest> items;

    public Integer getSupplierId() { return supplierId; }
    public void setSupplierId(Integer supplierId) { this.supplierId = supplierId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public List<InventoryReceiptItemRequest> getItems() { return items; }
    public void setItems(List<InventoryReceiptItemRequest> items) { this.items = items; }

    public static class InventoryReceiptItemRequest {
        @NotNull
        private Integer productId;
        @NotNull
        @Min(1)
        private Integer quantity;
        @NotNull
        @Min(0)
        private Integer unitPrice;

        public Integer getProductId() { return productId; }
        public void setProductId(Integer productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        public Integer getUnitPrice() { return unitPrice; }
        public void setUnitPrice(Integer unitPrice) { this.unitPrice = unitPrice; }
    }
}
