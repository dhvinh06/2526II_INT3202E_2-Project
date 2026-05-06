package com.example.dbms.service;

import com.example.dbms.dto.ShippingAddressRequest;
import com.example.dbms.entity.ShippingAddress;
import com.example.dbms.entity.User;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.ShippingAddressRepository;
import com.example.dbms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShippingAddressService {
    private final ShippingAddressRepository shippingAddressRepository;
    private final UserRepository userRepository;

    public ShippingAddressService(ShippingAddressRepository shippingAddressRepository, UserRepository userRepository) {
        this.shippingAddressRepository = shippingAddressRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> listByUser(Integer userId) {
        return shippingAddressRepository.findByUserId(userId).stream().map(this::toMap).toList();
    }

    @Transactional
    public Map<String, Object> create(ShippingAddressRequest req) {
        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "User not found"));
        ShippingAddress address = new ShippingAddress();
        address.setUser(user);
        address.setReceiverName(req.getReceiverName());
        address.setPhone(req.getPhone());
        address.setAddress(req.getAddress());
        address.setIsDefault(Boolean.TRUE.equals(req.getIsDefault()));
        return toMap(shippingAddressRepository.save(address));
    }

    public Map<String, Object> update(Integer id, ShippingAddressRequest req) {
        ShippingAddress address = shippingAddressRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Address not found"));
        address.setReceiverName(req.getReceiverName());
        address.setPhone(req.getPhone());
        address.setAddress(req.getAddress());
        address.setIsDefault(Boolean.TRUE.equals(req.getIsDefault()));
        return toMap(shippingAddressRepository.save(address));
    }

    public void delete(Integer id) { shippingAddressRepository.deleteById(id); }

    public ShippingAddress validateForCheckout(Integer userId, Integer addressId, ShippingAddressRequest newAddress) {
        if (addressId != null) {
            ShippingAddress address = shippingAddressRepository.findById(addressId)
                    .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Address not found"));
            if (!address.getUser().getId().equals(userId)) {
                throw new ApiException(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, "Address does not belong to user");
            }
            return address;
        }
        if (newAddress != null) {
            newAddress.setUserId(userId);
            Map<String, Object> created = create(newAddress);
            return shippingAddressRepository.findById((Integer) created.get("id")).orElseThrow();
        }
        throw new ApiException(ErrorCode.VALIDATION_FAILED, HttpStatus.BAD_REQUEST, "SelectAddress/CreateNewAddress is required");
    }

    private Map<String, Object> toMap(ShippingAddress a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("userId", a.getUser().getId());
        m.put("receiverName", a.getReceiverName());
        m.put("phone", a.getPhone());
        m.put("address", a.getAddress());
        m.put("isDefault", a.getIsDefault());
        return m;
    }
}
