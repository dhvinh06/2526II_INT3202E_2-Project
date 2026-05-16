package com.example.dbms.dto;

public class CheckoutRequest {
    private Integer shippingAddressId;
    private ShippingAddressRequest newAddress;

    public Integer getShippingAddressId() {
        return shippingAddressId;
    }

    public void setShippingAddressId(Integer shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }

    public ShippingAddressRequest getNewAddress() {
        return newAddress;
    }

    public void setNewAddress(ShippingAddressRequest newAddress) {
        this.newAddress = newAddress;
    }

    private String couponCode;

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}
