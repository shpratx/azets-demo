package com.azets.alm.rules.repository;

import com.azets.alm.common.enums.RuleStatus;
import com.azets.alm.rules.domain.MappingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MappingRuleRepository extends JpaRepository<MappingRule, String> {

    /** Evaluation order is priority ascending - lower first (LLD 3.2). */
    List<MappingRule> findByTenantIdAndStatusOrderByPriorityAsc(UUID tenantId, RuleStatus status);

    List<MappingRule> findByTenantIdOrderByPriorityAsc(UUID tenantId);

    Optional<MappingRule> findByIdAndTenantId(String id, UUID tenantId);

    boolean existsByTenantIdAndPriorityAndStatus(UUID tenantId, int priority, RuleStatus status);

    long countByTenantId(UUID tenantId);
}
