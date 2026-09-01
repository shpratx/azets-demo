package com.azets.alm.audit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Append-only hash-chained audit store, timeline and report generation (F1.7). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.audit", "com.azets.alm.common"})
public class AuditApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuditApplication.class, args);
    }
}
