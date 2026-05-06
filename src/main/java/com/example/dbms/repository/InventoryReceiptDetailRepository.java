package com.example.dbms.repository;

import com.example.dbms.entity.InventoryReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryReceiptDetailRepository extends JpaRepository<InventoryReceiptDetail, Integer> {
    List<InventoryReceiptDetail> findByReceiptId(Integer receiptId);
}
