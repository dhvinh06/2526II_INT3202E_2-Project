package com.example.dbms.service;

import com.example.dbms.entity.*;

import java.util.HashMap;
import java.util.Map;

public final class CommonMapper {
    private CommonMapper() {
    }

    public static Map<String, Object> product(Product p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("price", p.getPrice());
        m.put("image", p.getImage());
        m.put("images", p.getImages());
        m.put("description", p.getDescription());
        m.put("rating", p.getRating());
        m.put("sold", p.getSold());
        m.put("stock", p.getStock());
        m.put("categoryId", p.getCategory() != null ? p.getCategory().getId() : null);
        m.put("brandId", p.getBrand() != null ? p.getBrand().getId() : null);
        return m;
    }

    public static Map<String, Object> order(Order o) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", o.getId());
        m.put("userId", o.getUser().getId());
        m.put("totalAmount", o.getTotalAmount());
        m.put("status", o.getStatus());
        m.put("createdAt", o.getCreatedAt());
        return m;
    }
}
