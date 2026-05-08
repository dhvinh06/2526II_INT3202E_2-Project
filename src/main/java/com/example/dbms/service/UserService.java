package com.example.dbms.service;

import com.example.dbms.dto.ChangePasswordRequest;
import com.example.dbms.dto.UpdateProfileRequest;
import com.example.dbms.entity.User;
import com.example.dbms.exception.ApiException;
import com.example.dbms.exception.ErrorCode;
import com.example.dbms.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Map<String, Object> getProfile(Integer id) {
        User user = getUser(id);
        return mapUser(user);
    }

    public Map<String, Object> updateProfile(Integer id, UpdateProfileRequest req) {
        User user = getUser(id);
        
        // Check if email is changing and if it is already taken
        if (!user.getEmail().equals(req.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException(ErrorCode.CONFLICT, HttpStatus.CONFLICT, "Email is already taken");
        }

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        return mapUser(userRepository.save(user));
    }

    public void changePassword(Integer id, ChangePasswordRequest req) {
        User user = getUser(id);

        if (!user.getPassword().equals(req.getOldPassword())) {
            throw new ApiException(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST, "Incorrect old password");
        }

        user.setPassword(req.getNewPassword());
        userRepository.save(user);
    }

    private User getUser(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND, "User not found"));
    }

    private Map<String, Object> mapUser(User u) {
        return Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "",
                "role", u.getRole() != null ? u.getRole().getName() : null
        );
    }
}
