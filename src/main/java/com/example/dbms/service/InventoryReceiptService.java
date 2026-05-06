package com.example.dbms.service;

import com.example.dbms.dto.InventoryReceiptRequest;
import com.example.dbms.entity.*;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class InventoryReceiptService {
    private final InventoryReceiptRepository receiptRepository;
    private final InventoryReceiptDetailRepository detailRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public InventoryReceiptService(InventoryReceiptRepository receiptRepository, InventoryReceiptDetailRepository detailRepository, SupplierRepository supplierRepository, ProductRepository productRepository) {
        this.receiptRepository = receiptRepository;
        this.detailRepository = detailRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Map<String, Object> create(InventoryReceiptRequest req) {
        InventoryReceipt receipt = new InventoryReceipt();
        if (req.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(req.getSupplierId())
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Supplier not found"));
            receipt.setSupplier(supplier);
        }
        receipt.setNote(req.getNote());
        receipt.setTotalCost(0);
        receipt = receiptRepository.save(receipt);

        int total = 0;
        List<Map<String, Object>> items = new ArrayList<>();
        for (InventoryReceiptRequest.InventoryReceiptItemRequest itemReq : req.getItems()) {
            Product p = productRepository.findByIdForUpdate(itemReq.getProductId())
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
            p.setStock(p.getStock() + itemReq.getQuantity());
            productRepository.save(p);

            InventoryReceiptDetail d = new InventoryReceiptDetail();
            d.setReceipt(receipt);
            d.setProduct(p);
            d.setQuantity(itemReq.getQuantity());
            d.setUnitPrice(itemReq.getUnitPrice());
            d = detailRepository.save(d);
            total += itemReq.getQuantity() * itemReq.getUnitPrice();
            items.add(Map.of("id", d.getId(), "productId", p.getId(), "quantity", d.getQuantity(), "unitPrice", d.getUnitPrice()));
        }
        receipt.setTotalCost(total);
        receipt = receiptRepository.save(receipt);

        Map<String, Object> data = map(receipt);
        data.put("items", items);
        return data;
    }

    public List<Map<String, Object>> all() {
        return receiptRepository.findAll().stream().map(this::map).toList();
    }

    public Map<String, Object> byId(Integer id) {
        InventoryReceipt r = receiptRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Receipt not found"));
        Map<String, Object> data = map(r);
        data.put("items", detailRepository.findByReceiptId(id).stream().map(d -> Map.of(
                "id", d.getId(), "productId", d.getProduct().getId(), "quantity", d.getQuantity(), "unitPrice", d.getUnitPrice()
        )).toList());
        return data;
    }

    private Map<String, Object> map(InventoryReceipt r) {
        return new HashMap<>(Map.of(
                "id", r.getId(),
                "supplierId", r.getSupplier() != null ? r.getSupplier().getId() : null,
                "totalCost", r.getTotalCost(),
                "note", r.getNote(),
                "createdAt", r.getCreatedAt()
        ));
    }
}
