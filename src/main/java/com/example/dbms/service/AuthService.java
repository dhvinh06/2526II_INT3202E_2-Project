package com.example.dbms.service;

import com.example.dbms.dto.AuthRequest;
import com.example.dbms.dto.RegisterRequest;
import com.example.dbms.entity.Role;
import com.example.dbms.entity.User;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.RoleRepository;
import com.example.dbms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${app.admin-secret}")
    private String adminSecret;

    private static final List<String> VALID_ROLES = List.of("CUSTOMER", "SELLER", "ADMIN");

    public AuthService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public Map<String, Object> login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApiException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!user.getPassword().equals(req.getPassword())) {
            throw new ApiException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return mapUser(user);
    }

    public Map<String, Object> register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException(ErrorCode.CONFLICT, HttpStatus.CONFLICT, "Email is already taken");
        }

        String roleName = req.getRole() == null ? "CUSTOMER" : req.getRole().toUpperCase();

        if (!VALID_ROLES.contains(roleName)) {
            throw new ApiException(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, "Invalid role");
        }

        if ("ADMIN".equals(roleName)) {
            if (req.getAdminSecret() == null || !req.getAdminSecret().equals(adminSecret)) {
                throw new ApiException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, "Mã xác nhận admin không đúng");
            }
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ApiException(ErrorCode.INTERNAL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR, "Role not found"));

        User newUser = new User();
        newUser.setName(req.getName());
        newUser.setEmail(req.getEmail());
        newUser.setPassword(req.getPassword());
        newUser.setCreatedAt(Instant.now());
        newUser.setRole(role);
        return mapUser(userRepository.save(newUser));
    }

    private Map<String, Object> mapUser(User u) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("name", u.getName());
        map.put("email", u.getEmail());
        map.put("role", u.getRole() != null ? u.getRole().getName() : null);
        return map;
    }
}
