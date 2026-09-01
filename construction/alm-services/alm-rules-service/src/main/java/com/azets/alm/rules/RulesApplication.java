package com.azets.alm.rules;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Deterministic rule evaluation and simulation over a restricted DSL (F0.4). */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.rules", "com.azets.alm.common"})
public class RulesApplication {
    public static void main(String[] args) {
        SpringApplication.run(RulesApplication.class, args);
    }
}
