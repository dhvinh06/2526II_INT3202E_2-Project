package com.example.dbms.controller;

import com.example.dbms.dto.*;
import com.example.dbms.entity.Brand;
import com.example.dbms.entity.Category;
import com.example.dbms.entity.Product;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.BrandRepository;
import com.example.dbms.repository.CategoryRepository;
import com.example.dbms.repository.ProductRepository;
import com.example.dbms.service.InventoryReceiptService;
import com.example.dbms.service.OrderService;
import com.example.dbms.service.ProductService;
import com.example.dbms.service.UserAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserAdminService userAdminService;
    private final OrderService orderService;
    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final InventoryReceiptService inventoryReceiptService;
    private final ProductRepository productRepository;

    public AdminController(UserAdminService userAdminService, OrderService orderService, ProductService productService, CategoryRepository categoryRepository, BrandRepository brandRepository, InventoryReceiptService inventoryReceiptService,ProductRepository productRepository) {
        this.userAdminService = userAdminService;
        this.orderService = orderService;
        this.productService = productService;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.inventoryReceiptService = inventoryReceiptService;
        this.productRepository = productRepository;
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return userAdminService.allUsers();
    }

    @PutMapping("/users/{id}/role")
    public Map<String, Object> updateRole(@PathVariable Integer id, @Valid @RequestBody UpdateUserRoleRequest req) {
        return userAdminService.updateRole(id, req.getRoleId());
    }

    @GetMapping("/orders")
    public List<Map<String, Object>> orders(@RequestParam(required = false) String status) {
        return orderService.all(status);
    }

    @PutMapping("/orders/{id}/status")
    public Map<String, Object> updateOrder(@PathVariable String id, @Valid @RequestBody UpdateOrderStatusRequest req) {
        return orderService.updateStatus(id, req.getStatus());
    }

    @PostMapping("/products")
    public Object createProduct(@Valid @RequestBody ProductRequest req) {
        Product saved = productService.save(req, null);
        return productService.get(saved.getId());
    }
    @PutMapping("/products/{id}")
    public Object updateProduct(@PathVariable Integer id, @Valid @RequestBody ProductRequest req) {
        return productService.save(req, id);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Integer id) {
        productService.delete(id);
    }

    @GetMapping("/categories")
    public List<?> categories() {
        return categoryRepository.findAll();
    }

    @PostMapping("/categories")
    public Object createCategory(@RequestBody Category body) {
        return categoryRepository.save(body);
    }

    @PutMapping("/categories/{id}")
    public Object updateCategory(@PathVariable Integer id, @RequestBody Category body) {
        body.setId(id);
        return categoryRepository.save(body);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable Integer id) {
        categoryRepository.deleteById(id);
    }

    @GetMapping("/brands")
    public List<?> brands() {
        return brandRepository.findAll();
    }

    @PostMapping("/brands")
    public Object createBrand(@RequestBody Brand body) {
        return brandRepository.save(body);
    }

    @PutMapping("/brands/{id}")
    public Object updateBrand(@PathVariable Integer id, @RequestBody Brand body) {
        body.setId(id);
        return brandRepository.save(body);
    }

    @DeleteMapping("/brands/{id}")
    public void deleteBrand(@PathVariable Integer id) {
        brandRepository.deleteById(id);
    }

    @PostMapping("/inventory-receipts")
    public Map<String, Object> createReceipt(@Valid @RequestBody InventoryReceiptRequest req) {
        return inventoryReceiptService.create(req);
    }

    @GetMapping("/inventory-receipts")
    public List<Map<String, Object>> receipts() {
        return inventoryReceiptService.all();
    }

    @GetMapping("/inventory-receipts/{id}")
    public Map<String, Object> receipt(@PathVariable Integer id) {
        return inventoryReceiptService.byId(id);
    }

    @GetMapping("/products/pending")
    public List<Map<String, Object>> getPendingProducts() {
        return productService.getByStatus(Product.Status.PENDING);
    }

    @PutMapping("/products/{id}/status")
    public Object updateProductStatus(@PathVariable Integer id, @RequestParam String status) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
        p.setStatus(Product.Status.valueOf(status));
        productRepository.save(p);
        return productService.get(id);
    }
}
