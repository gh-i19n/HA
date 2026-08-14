package org.i19n.healthalst.modules.access.interfaces.dto;

/** Transport payload for the local MVP login form. */
public record LoginRequest(String email, String password) {}
