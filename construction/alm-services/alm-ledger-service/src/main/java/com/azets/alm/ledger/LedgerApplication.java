package com.azets.alm.ledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Master ledger CRUD, versioning and classification (F0.3). Read-only to Mapping and Review. */
@SpringBootApplication(scanBasePackages = {"com.azets.alm.ledger", "com.azets.alm.common"})
public class LedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(LedgerApplication.class, args);
    }
}
