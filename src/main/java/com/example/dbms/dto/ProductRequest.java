package com.example.dbms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {
    @NotBlank
    private String name;
    @NotNull
    private Integer price;
    private String image;
    private String description;
    private Integer categoryId;
    private String brandName;
    private Integer stock;
    private Integer sellerId;


}
