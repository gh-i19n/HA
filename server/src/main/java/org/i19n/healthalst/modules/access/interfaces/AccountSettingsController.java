package org.i19n.healthalst.modules.access.interfaces;

import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.i19n.healthalst.modules.access.application.AccountSettingsService;
import org.i19n.healthalst.modules.access.application.AuthenticatedUser;
import org.i19n.healthalst.modules.access.domain.MembershipStatus;
import org.i19n.healthalst.modules.access.domain.OrganizationRole;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Eventorch-derived HTTP surface for account, clinic, team, and preference settings. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AccountSettingsController {

    private final AccountSettingsService service;

    @GetMapping("/organizations")
    public List<AccountSettingsService.OrganizationSummary> organizations(
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.organizations(actor);
    }

    @PatchMapping("/profile")
    public AccountSettingsService.ProfileSummary updateProfile(
            @AuthenticationPrincipal AuthenticatedUser actor,
            @RequestBody ProfileRequest request) {
        return service.updateProfile(actor, request.displayName(), request.phone(), request.avatarUrl());
    }

    @GetMapping("/organizations/current")
    public AccountSettingsService.ClinicSummary clinic(@AuthenticationPrincipal AuthenticatedUser actor) {
        return service.clinic(actor);
    }

    @PatchMapping("/organizations/current")
    public AccountSettingsService.ClinicSummary updateClinic(
            @AuthenticationPrincipal AuthenticatedUser actor,
            @RequestBody ClinicRequest request) {
        return service.updateClinic(actor, request.name(), request.email(), request.phone(), request.address());
    }

    @GetMapping("/organizations/current/members")
    public List<AccountSettingsService.MemberSummary> members(@AuthenticationPrincipal AuthenticatedUser actor) {
        return service.members(actor);
    }

    @PostMapping("/organizations/current/members")
    public AccountSettingsService.MemberSummary createMember(
            @AuthenticationPrincipal AuthenticatedUser actor,
            @RequestBody AddMemberRequest request) {
        return service.createMember(actor, request.displayName(), request.email(), request.role());
    }

    @PatchMapping("/organizations/current/members")
    public AccountSettingsService.MemberSummary updateMember(
            @AuthenticationPrincipal AuthenticatedUser actor,
            @RequestBody UpdateMemberRequest request) {
        return service.updateMember(actor, request.membershipId(), request.role(), request.status());
    }

    @GetMapping("/settings/notifications")
    public AccountSettingsService.NotificationPreferenceSummary notificationPreferences(
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return service.notificationPreferences(actor);
    }

    @PatchMapping("/settings/notifications")
    public AccountSettingsService.NotificationPreferenceSummary updateNotificationPreferences(
            @AuthenticationPrincipal AuthenticatedUser actor,
            @RequestBody NotificationPreferenceRequest request) {
        return service.updateNotificationPreferences(
                actor, request.reportUpdates(), request.membershipUpdates(), request.emailUpdates());
    }

    public record ProfileRequest(String displayName, String phone, String avatarUrl) {}
    public record ClinicRequest(String name, String email, String phone, String address) {}
    public record AddMemberRequest(String displayName, String email, OrganizationRole role) {}
    public record UpdateMemberRequest(UUID membershipId, OrganizationRole role, MembershipStatus status) {}
    public record NotificationPreferenceRequest(boolean reportUpdates, boolean membershipUpdates, boolean emailUpdates) {}
}
