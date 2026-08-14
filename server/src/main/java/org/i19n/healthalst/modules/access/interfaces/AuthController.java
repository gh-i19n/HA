package org.i19n.healthalst.modules.access.interfaces;

import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.access.application.AuthenticationService;
import org.i19n.healthalst.modules.access.interfaces.dto.LoginRequest;
import org.i19n.healthalst.modules.access.interfaces.dto.UserResponse;
import org.i19n.healthalst.modules.access.application.RegistrationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** HTTP adapter for login, current-account lookup, and logout. */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final String COOKIE_NAME = "healthalst_session";
    private final AuthenticationService authenticationService;
    private final RegistrationService registrationService;

    public AuthController(AuthenticationService authenticationService, RegistrationService registrationService) {
        this.authenticationService = authenticationService;
        this.registrationService = registrationService;
    }

    /** Authenticates the request and returns an HttpOnly cookie plus safe account data. */
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest request) {
        AuthenticationService.AuthenticationResult result = authenticationService.login(request.email(), request.password());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, sessionCookie(result.token()).toString())
                .body(UserResponse.from(result.user()));
    }

    /** Creates a laboratory, its owner membership, and a signed-in persisted identity atomically. */
    @PostMapping("/register/laboratory")
    public ResponseEntity<UserResponse> registerLaboratory(@RequestBody LaboratoryRegistrationRequest request) {
        var result = registrationService.registerLaboratory(
                request.ownerName(), request.email(), request.password(),
                request.laboratoryName(), request.location(), request.address());
        return authenticated(result);
    }

    /** Changes the active clinic on the current server-owned session. */
    @PostMapping("/switch-organization")
    public UserResponse switchOrganization(
            @CookieValue(name = COOKIE_NAME) String token,
            @RequestBody SwitchOrganizationRequest request
    ) {
        return UserResponse.from(authenticationService.switchOrganization(token, request.organizationId()));
    }

    /** Returns the principal created by the security filter. */
    @GetMapping("/me")
    public UserResponse currentUser(@AuthenticationPrincipal AuthenticatedUser user) {
        return UserResponse.from(user);
    }

    /** Revokes the current session and clears the browser cookie. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = COOKIE_NAME, required = false) String token) {
        authenticationService.logout(token);
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, expiredCookie().toString()).build();
    }

    /** Builds the browser session cookie for local development. */
    private ResponseCookie sessionCookie(String token) {
        return ResponseCookie.from(COOKIE_NAME, token).httpOnly(true).sameSite("Lax")
                .path("/").maxAge(8 * 60 * 60).build();
    }

    /** Builds a cookie deletion response after logout. */
    private ResponseCookie expiredCookie() {
        return ResponseCookie.from(COOKIE_NAME, "").httpOnly(true).sameSite("Lax")
                .path("/").maxAge(0).build();
    }

    private ResponseEntity<UserResponse> authenticated(AuthenticationService.AuthenticationResult result) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, sessionCookie(result.token()).toString())
                .body(UserResponse.from(result.user()));
    }

    public record LaboratoryRegistrationRequest(
            String ownerName, String email, String password,
            String laboratoryName, String location, String address) {}
    public record SwitchOrganizationRequest(java.util.UUID organizationId) {}
}
