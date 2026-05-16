package com.example.dbms.repository;

import com.example.dbms.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CouponRepository extends JpaRepository<Coupon, String> {

    @Query(value = "SELECT fn_calculate_discount(:total, :percent)", nativeQuery = true)
    Integer calculateDiscountedTotal(@Param("total") Integer total, @Param("percent") Integer percent);

}
