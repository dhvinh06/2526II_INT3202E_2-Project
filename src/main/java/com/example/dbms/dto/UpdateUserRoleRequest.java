package com.example.dbms.dto;

import jakarta.validation.constraints.NotNull;

public class UpdateUserRoleRequest {
    @NotNull
    private Integer roleId;

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }
}
