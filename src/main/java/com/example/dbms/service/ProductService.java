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
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    public List<Map<String, Object>> browse(Integer categoryId, Integer brandId, int page, int size) {
        return productRepository.search(categoryId, brandId, PageRequest.of(page, size))
                .map(CommonMapper::product).toList();
    }

    public Map<String, Object> get(Integer id) {
        return CommonMapper.product(productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found")));
    }

    public Product save(ProductRequest req, Integer id) {
        Product p = id == null ? new Product() : productRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Product not found"));
        p.setName(req.getName());
        p.setPrice(req.getPrice());
        p.setImage(req.getImage());
        p.setImages(req.getImages());
        p.setDescription(req.getDescription());
        if (req.getCategoryId() != null) {
            Category c = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Category not found"));
            p.setCategory(c);
        } else {
            p.setCategory(null);
        }
        if (req.getBrandId() != null) {
            Brand b = brandRepository.findById(req.getBrandId())
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Brand not found"));
            p.setBrand(b);
        } else {
            p.setBrand(null);
        }
        if (id == null) {
            p.setSold(0);
            p.setStock(0);
        }
        return productRepository.save(p);
    }

    public void delete(Integer id) {
        productRepository.deleteById(id);
    }
}
