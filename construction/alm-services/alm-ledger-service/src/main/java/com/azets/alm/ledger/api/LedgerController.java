package com.azets.alm.ledger.api;

import com.azets.alm.common.dto.PageResponse;
import com.azets.alm.common.enums.AccountType;
import com.azets.alm.common.security.AlmPrincipal;
import com.azets.alm.common.security.CurrentUser;
import com.azets.alm.common.security.Rbac;
import com.azets.alm.ledger.api.dto.LedgerDtos.DeactivationResponse;
import com.azets.alm.ledger.api.dto.LedgerDtos.LedgerIndexResponse;
import com.azets.alm.ledger.api.dto.LedgerDtos.LedgerVersionResponse;
import com.azets.alm.ledger.api.dto.LedgerDtos.MasterLedgerAccountInput;
import com.azets.alm.ledger.api.dto.LedgerDtos.MasterLedgerAccountResponse;
import com.azets.alm.ledger.service.LedgerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Implements api-specs/ledger-service.yaml. Write operations are Administrator-only per the
 * HLD 7.1 matrix; the annotation is the control, and the UI's disabled state is convenience
 * only (LLD 8.4).
 */
@RestController
@RequestMapping("/ledger/v1")
@Tag(name = "Ledger")
public class LedgerController {

    private final LedgerService ledger;
    private final CurrentUser currentUser;

    public LedgerController(LedgerService ledger, CurrentUser currentUser) {
        this.ledger = ledger;
        this.currentUser = currentUser;
    }

    @GetMapping("/accounts")
    @PreAuthorize(Rbac.CAN_READ)
    @Operation(summary = "Search the master ledger",
            description = "activeOnly defaults to true; suggestion contexts must never see inactive codes.")
    public PageResponse<MasterLedgerAccountResponse> search(
            @RequestParam(required = false) String ledgerVersion,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) AccountType type,
            @RequestParam(required = false) String classification,
            @RequestParam(defaultValue = "true") boolean activeOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        AlmPrincipal actor = currentUser.require();
        return PageResponse.from(
                ledger.search(actor.tenantId(), ledgerVersion, q, type, classification, activeOnly,
                        PageRequest.of(page, Math.min(size, 200))),
                MasterLedgerAccountResponse::from);
    }

    @GetMapping("/accounts/{code}")
    @PreAuthorize(Rbac.CAN_READ)
    public MasterLedgerAccountResponse get(@PathVariable String code,
                                           @RequestParam(required = false) String ledgerVersion) {
        AlmPrincipal actor = currentUser.require();
        return MasterLedgerAccountResponse.from(ledger.get(actor.tenantId(), code, ledgerVersion));
    }

    @PostMapping("/accounts")
    @PreAuthorize(Rbac.IS_ADMIN)
    public ResponseEntity<MasterLedgerAccountResponse> create(@Valid @RequestBody MasterLedgerAccountInput in) {
        AlmPrincipal actor = currentUser.require();
        MasterLedgerAccountResponse body = MasterLedgerAccountResponse.from(
                ledger.create(actor, in.code(), in.name(), in.classification(), in.type(), in.parentCode()));
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PutMapping("/accounts/{code}")
    @PreAuthorize(Rbac.IS_ADMIN)
    public MasterLedgerAccountResponse update(@PathVariable String code,
                                              @Valid @RequestBody MasterLedgerAccountInput in) {
        AlmPrincipal actor = currentUser.require();
        return MasterLedgerAccountResponse.from(
                ledger.update(actor, code, in.name(), in.classification(), in.type(), in.parentCode()));
    }

    @PostMapping("/accounts/{code}:deactivate")
    @PreAuthorize(Rbac.IS_ADMIN)
    @Operation(summary = "Deactivate a master ledger account",
            description = "Never a hard delete. Sessions pinned to an earlier version are unaffected.")
    public DeactivationResponse deactivate(@PathVariable String code) {
        AlmPrincipal actor = currentUser.require();
        return new DeactivationResponse(
                MasterLedgerAccountResponse.from(ledger.deactivate(actor, code)),
                List.of());
    }

    @GetMapping("/versions")
    @PreAuthorize(Rbac.CAN_READ)
    public List<LedgerVersionResponse> versions() {
        AlmPrincipal actor = currentUser.require();
        return ledger.listVersions(actor.tenantId()).stream().map(LedgerVersionResponse::from).toList();
    }

    @GetMapping("/versions/current")
    @PreAuthorize(Rbac.CAN_READ)
    @Operation(summary = "Get the current active ledger version",
            description = "Called by Intake at session creation to pin the version onto the session.")
    public LedgerVersionResponse currentVersion() {
        AlmPrincipal actor = currentUser.require();
        return LedgerVersionResponse.from(ledger.currentVersion(actor.tenantId()));
    }

    @GetMapping("/versions/{version}/index")
    @PreAuthorize(Rbac.CAN_READ)
    @Operation(summary = "Active-account index for a ledger version",
            description = "Bulk read for the mapping engine. Active accounts only.")
    public LedgerIndexResponse index(@PathVariable String version) {
        AlmPrincipal actor = currentUser.require();
        return new LedgerIndexResponse(version,
                ledger.activeIndex(actor.tenantId(), version).stream()
                        .map(MasterLedgerAccountResponse::from)
                        .toList());
    }
}
