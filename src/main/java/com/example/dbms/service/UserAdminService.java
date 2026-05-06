package com.example.dbms.service;

import com.example.dbms.entity.Role;
import com.example.dbms.entity.User;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.RoleRepository;
import com.example.dbms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserAdminService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserAdminService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public List<Map<String, Object>> allUsers() {
        return userRepository.findAll().stream().map(this::mapUser).toList();
    }

    public Map<String, Object> updateRole(Integer userId, Integer roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "User not found"));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "Role not found"));
        user.setRole(role);
        return mapUser(userRepository.save(user));
    }

    private Map<String, Object> mapUser(User u) {
        return Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "roleId", u.getRole() != null ? u.getRole().getId() : null,
                "roleName", u.getRole() != null ? u.getRole().getName() : null
        );
    }
}
