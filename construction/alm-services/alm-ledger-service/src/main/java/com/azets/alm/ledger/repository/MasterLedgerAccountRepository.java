package com.azets.alm.ledger.repository;

import com.azets.alm.common.enums.AccountType;
import com.azets.alm.ledger.domain.MasterLedgerAccount;
import com.azets.alm.ledger.domain.MasterLedgerAccountId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MasterLedgerAccountRepository
        extends JpaRepository<MasterLedgerAccount, MasterLedgerAccountId> {

    Optional<MasterLedgerAccount> findByCodeAndLedgerVersionAndTenantId(
            String code, String ledgerVersion, UUID tenantId);

    List<MasterLedgerAccount> findByLedgerVersionAndTenantId(String ledgerVersion, UUID tenantId);

    /** The bulk index used by the mapping engine. Active only, by construction (TS-MAP-11). */
    @Query("""
            select a from MasterLedgerAccount a
            where a.ledgerVersion = :version and a.tenantId = :tenantId and a.status = com.azets.alm.common.enums.LedgerAccountStatus.ACTIVE
            """)
    List<MasterLedgerAccount> findActiveIndex(@Param("version") String version,
                                              @Param("tenantId") UUID tenantId);

    /**
     * Type-ahead over code, name and classification. activeOnly is honoured by the caller passing
     * false only in administration contexts - suggestion contexts always pass true.
     */
    @Query("""
            select a from MasterLedgerAccount a
            where a.tenantId = :tenantId
              and a.ledgerVersion = :version
              and (:activeOnly = false or a.status = com.azets.alm.common.enums.LedgerAccountStatus.ACTIVE)
              and (:type is null or a.type = :type)
              and (:classification is null or lower(a.classification) = lower(:classification))
              and (:q is null
                   or lower(a.code) like lower(concat('%', :q, '%'))
                   or lower(a.name) like lower(concat('%', :q, '%'))
                   or lower(a.classification) like lower(concat('%', :q, '%')))
            order by a.code asc
            """)
    Page<MasterLedgerAccount> search(@Param("tenantId") UUID tenantId,
                                     @Param("version") String version,
                                     @Param("q") String q,
                                     @Param("type") AccountType type,
                                     @Param("classification") String classification,
                                     @Param("activeOnly") boolean activeOnly,
                                     Pageable pageable);
}
