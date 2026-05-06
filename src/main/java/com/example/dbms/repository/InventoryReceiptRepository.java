package com.example.dbms.repository;

import com.example.dbms.entity.InventoryReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryReceiptRepository extends JpaRepository<InventoryReceipt, Integer> {}
