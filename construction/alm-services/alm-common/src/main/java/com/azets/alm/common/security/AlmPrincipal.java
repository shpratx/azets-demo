package com.azets.alm.common.security;

import com.azets.alm.common.enums.Role;

import java.util.UUID;

/**
 * The authenticated caller, projected from the IdP-issued JWT. ALM never issues credentials of
 * its own (AP-9.1); this is a read-only view of claims validated at the gateway.
 */
public record AlmPrincipal(String userId, String displayName, String email, Role role, UUID tenantId) {

    public boolean isReadOnly() {
        return role == Role.AUDITOR;
    }

    public boolean canApprove() {
        return role == Role.FINANCE_MANAGER || role == Role.ADMINISTRATOR;
    }

    public boolean canWrite() {
        return role != Role.AUDITOR;
    }

    /** Audit actor string, LLD 1.8: a user principal, or system:<service> for service actors. */
    public String asActor() {
        return userId;
    }
}
