package com.example.dbms.repository;

import com.example.dbms.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    @Query("select p from Product p where (:categoryId is null or p.category.id = :categoryId) " +
           "and (:brandId is null or p.brand.id = :brandId) " +
           "and (:search is null or lower(p.name) like lower(concat('%', :search, '%'))) " +
           "and p.status = 'APPROVED' and p.stock > 0 order by p.id desc")
    Page<Product> search(@Param("categoryId") Integer categoryId, @Param("brandId") Integer brandId, @Param("search") String search, Pageable pageable);
    
    @Query("select p from Product p where p.seller.id = :sellerId " +
           "and (:search is null or lower(p.name) like lower(concat('%', :search, '%'))) " +
           "order by p.id desc")
    List<Product> findBySeller(@Param("sellerId") Integer sellerId, @Param("search") String search);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id in :ids")
    List<Product> findAllByIdInForUpdate(@Param("ids") List<Integer> ids);
    List<Product> findByStatus(Product.Status status);

    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "CALL sp_update_product_stock(:productId, :quantityChange)", nativeQuery = true)
    void updateProductStock(@Param("productId") Integer productId, @Param("quantityChange") Integer quantityChange);

    @Query(value = "SELECT fn_calculate_discount(price, :discountPercent) FROM products WHERE id = :id", nativeQuery = true)
    Integer getDiscountedPrice(@Param("id") Integer id, @Param("discountPercent") Integer discountPercent);
}
