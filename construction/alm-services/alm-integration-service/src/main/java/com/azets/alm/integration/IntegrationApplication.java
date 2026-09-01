package com.azets.alm.integration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Cozone export behind an adapter, with idempotency, retry and quarantine (F1.6). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.integration", "com.azets.alm.common"})
public class IntegrationApplication {
    public static void main(String[] args) {
        SpringApplication.run(IntegrationApplication.class, args);
    }
}
