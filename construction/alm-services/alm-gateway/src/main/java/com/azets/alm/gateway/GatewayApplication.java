package com.azets.alm.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The single ingress. Per AP-2.6 the gateway owns authentication, authorisation, request schema
 * validation and rate limiting - and nothing else. There is deliberately no business logic here:
 * a rule that belongs to a domain lives in that domain's service.
 */
@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
