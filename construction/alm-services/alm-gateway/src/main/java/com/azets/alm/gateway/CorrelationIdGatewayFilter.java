package com.azets.alm.gateway;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Mints the correlation id when the client does not supply one, so that every request has an
 * end-to-end trace key from its very first hop (AP-7.2). Downstream services propagate it; the
 * support flow shows it to the user so they never have to go looking for it (UF-13).
 */
@Component
public class CorrelationIdGatewayFilter implements GlobalFilter, Ordered {

    private static final String HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String existing = exchange.getRequest().getHeaders().getFirst(HEADER);
        String correlationId = (existing == null || existing.isBlank())
                ? UUID.randomUUID().toString()
                : existing;

        ServerHttpRequest mutated = exchange.getRequest().mutate()
                .header(HEADER, correlationId)
                .build();
        exchange.getResponse().getHeaders().set(HEADER, correlationId);

        return chain.filter(exchange.mutate().request(mutated).build());
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
