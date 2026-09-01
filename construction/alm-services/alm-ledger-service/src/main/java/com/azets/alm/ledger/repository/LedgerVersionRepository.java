package com.azets.alm.ledger.repository;

import com.azets.alm.ledger.domain.LedgerVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LedgerVersionRepository extends JpaRepository<LedgerVersion, String> {

    Optional<LedgerVersion> findByTenantIdAndCurrentTrue(UUID tenantId);

    Optional<LedgerVersion> findByVersionAndTenantId(String version, UUID tenantId);

    List<LedgerVersion> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
