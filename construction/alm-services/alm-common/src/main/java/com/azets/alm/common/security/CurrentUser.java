package com.azets.alm.common.security;

import com.azets.alm.common.enums.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Resolves the caller from the security context. Every API re-checks authorisation server-side;
 * the UI guard is convenience only and is not a control (LLD 8.4, AP-9.5).
 */
@Component
public class CurrentUser {

    public static final String CLAIM_ROLE = "alm_role";
    public static final String CLAIM_TENANT = "alm_tenant";

    public AlmPrincipal require() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return from(jwtAuth.getToken());
        }
        throw new IllegalStateException("No authenticated principal on the security context");
    }

    public static AlmPrincipal from(Jwt jwt) {
        return new AlmPrincipal(
                jwt.getSubject(),
                jwt.getClaimAsString("name"),
                jwt.getClaimAsString("email"),
                Role.fromWire(jwt.getClaimAsString(CLAIM_ROLE)),
                UUID.fromString(jwt.getClaimAsString(CLAIM_TENANT)));
    }
}
