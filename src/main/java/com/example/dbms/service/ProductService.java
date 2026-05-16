package com.example.dbms.service;

import com.example.dbms.dto.ProductRequest;
import com.example.dbms.entity.Brand;
import com.example.dbms.entity.Category;
import com.example.dbms.entity.Product;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.BrandRepository;
import com.example.dbms.repository.CategoryRepository;
import com.example.dbms.repository.ProductRepository;
import com.example.dbms.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final UserRepository userRepository;
    private String brandName;

    public List<Map<String, Object>> getByStatus(Product.Status status) {
        return productRepository.findByStatus(status)
                .stream().map(CommonMapper::product).toList();
    }

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, BrandRepository brandRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> browse(Integer categoryId, Integer brandId, String search, int page, int size) {
        return productRepository.search(categoryId, brandId, search, PageRequest.of(page, size))
                .map(CommonMapper::product).toList();
    }

    public List<Map<String, Object>> getBySeller(Integer sellerId, String search) {
        return productRepository.findBySeller(sellerId, search)
                .stream().map(CommonMapper::product).toList();
    }

    public Map<String, Object> get(Integer id) {
        return CommonMapper.product(productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found")));
    }

    @Transactional
    public Product save(ProductRequest req, Integer id) {
        Product p = id == null ? new Product() : productRepository.findById(id)
                                                 .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
        p.setName(req.getName());
        p.setPrice(req.getPrice());
        p.setImage(req.getImage());
        p.setDescription(req.getDescription());
        if (req.getCategoryId() != null) {
            Category c = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Category not found"));
            p.setCategory(c);
        } else {
            p.setCategory(null);
        }
        if (req.getBrandName() != null && !req.getBrandName().isBlank()) {
            Brand b = brandRepository.findByName(req.getBrandName())
                    .orElseGet(() -> brandRepository.save(new Brand(req.getBrandName())));
            p.setBrand(b);
        } else {
            p.setBrand(null);
        }

        if (req.getSellerId() != null) {
            com.example.dbms.entity.User seller = userRepository.findById(req.getSellerId())
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Seller not found"));
            if (!"SELLER".equals(seller.getRole().getName())) {
                throw new ApiException(ErrorCode.NOT_ALLOWED, HttpStatus.FORBIDDEN, "Only users with role SELLER can be linked as product sellers");
            }
            p.setSeller(seller);
        }

        if (id == null) {
            p.setSold(0);
            p.setStock(req.getStock() != null ? req.getStock() : 0);
            p.setStatus(Product.Status.PENDING);
        } else {
            if (req.getStock() != null) {
                p.setStock(req.getStock());
            }
        }
        return productRepository.save(p);
    }

    @Transactional
    public void updateStock(Integer id, Integer quantityChange, Integer userId) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
        
        if (p.getSeller() != null && !p.getSeller().getId().equals(userId)) {
            throw new ApiException(ErrorCode.NOT_ALLOWED, HttpStatus.FORBIDDEN, "You are not the seller of this product");
        }
        
        productRepository.updateProductStock(id, quantityChange);
    }

    @Transactional
    public void updateStatus(Integer id, Product.Status status) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
        p.setStatus(status);
        productRepository.save(p);
    }

    public void delete(Integer id) {
        productRepository.deleteById(id);
    }
}
