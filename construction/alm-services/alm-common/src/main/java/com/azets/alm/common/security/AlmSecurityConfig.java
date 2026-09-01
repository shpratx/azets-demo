package com.azets.alm.common.security;

import com.azets.alm.common.enums.Role;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

import java.util.List;

/**
 * Resource-server posture shared by every ALM service. Services are stateless (AP-1.4): no HTTP
 * session is created, and the JWT is validated against the IdP's JWKS on every call (AP-9.3).
 * CSRF is disabled because there is no cookie-based session to forge against.
 */
@Configuration
@EnableMethodSecurity
public class AlmSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    /**
     * Maps the IdP's alm_role claim onto a Spring authority so that @PreAuthorize expressions
     * read as the HLD 7.1 matrix does.
     */
    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter() {
        return jwt -> {
            String roleClaim = jwt.getClaimAsString(CurrentUser.CLAIM_ROLE);
            List<GrantedAuthority> authorities = roleClaim == null
                    ? List.of()
                    : List.of(new SimpleGrantedAuthority(Role.fromWire(roleClaim).authority()));
            return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
        };
    }
}
