package com.example.dbms.controller;

import com.example.dbms.dto.ChangePasswordRequest;
import com.example.dbms.dto.UpdateProfileRequest;
import com.example.dbms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProfile(@PathVariable Integer id) {
        return userService.getProfile(id);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateProfile(@PathVariable Integer id, @Valid @RequestBody UpdateProfileRequest req) {
        return userService.updateProfile(id, req);
    }

    @PutMapping("/{id}/password")
    public Map<String, String> changePassword(@PathVariable Integer id, @Valid @RequestBody ChangePasswordRequest req) {
        userService.changePassword(id, req);
        return Map.of("message", "Password changed successfully");
    }
}
