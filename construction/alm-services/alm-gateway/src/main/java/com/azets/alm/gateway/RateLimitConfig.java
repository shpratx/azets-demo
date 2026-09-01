package com.azets.alm.gateway;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Rate limiting is a gateway responsibility (AP-2.6). Keying on the authenticated principal
 * rather than on IP means a shared corporate egress address cannot let one user exhaust the
 * budget of the whole finance team.
 */
@Configuration
public class RateLimitConfig {

    @Bean
    public KeyResolver principalKeyResolver() {
        return exchange -> exchange.getPrincipal()
                .map(java.security.Principal::getName)
                .defaultIfEmpty("anonymous")
                .flatMap(Mono::just);
    }
}
