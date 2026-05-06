package com.example.dbms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProductRequest {
    @NotBlank
    private String name;
    @NotNull
    private Integer price;
    private String image;
    private String images;
    private String description;
    private Integer categoryId;
    private Integer brandId;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public Integer getBrandId() { return brandId; }
    public void setBrandId(Integer brandId) { this.brandId = brandId; }
}
