package com.azets.alm.rules.api;

import com.azets.alm.common.enums.RuleStatus;
import com.azets.alm.common.security.AlmPrincipal;
import com.azets.alm.common.security.CurrentUser;
import com.azets.alm.common.security.Rbac;
import com.azets.alm.rules.api.dto.RuleDtos.EvaluationRequest;
import com.azets.alm.rules.api.dto.RuleDtos.EvaluationResponse;
import com.azets.alm.rules.api.dto.RuleDtos.RuleInput;
import com.azets.alm.rules.api.dto.RuleDtos.RuleResponse;
import com.azets.alm.rules.api.dto.RuleDtos.SimulationRequest;
import com.azets.alm.rules.api.dto.RuleDtos.SimulationResult;
import com.azets.alm.rules.service.RuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

/** Implements api-specs/rules-service.yaml. */
@RestController
@RequestMapping("/rules/v1")
@Tag(name = "Rules")
public class RuleController {

    private final RuleService rules;
    private final CurrentUser currentUser;

    public RuleController(RuleService rules, CurrentUser currentUser) {
        this.rules = rules;
        this.currentUser = currentUser;
    }

    @GetMapping("/rules")
    @PreAuthorize(Rbac.CAN_READ)
    @Operation(summary = "List rules in evaluation order",
            description = "Ordered by priority ascending. Lower evaluates first and the first match wins.")
    public List<RuleResponse> list(@RequestParam(required = false) RuleStatus status) {
        AlmPrincipal actor = currentUser.require();
        return rules.list(actor.tenantId(), status).stream().map(RuleResponse::from).toList();
    }

    @GetMapping("/rules/{ruleId}")
    @PreAuthorize(Rbac.CAN_READ)
    public RuleResponse get(@PathVariable String ruleId) {
        AlmPrincipal actor = currentUser.require();
        return RuleResponse.from(rules.get(actor.tenantId(), ruleId));
    }

    @PostMapping("/rules")
    @PreAuthorize(Rbac.IS_ADMIN)
    @Operation(summary = "Create a rule",
            description = "The condition is parsed at save time; a condition that does not parse is "
                    + "rejected with 422 and never stored.")
    public ResponseEntity<RuleResponse> create(@Valid @RequestBody RuleInput in) {
        AlmPrincipal actor = currentUser.require();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(RuleResponse.from(rules.create(actor, in)));
    }

    @PutMapping("/rules/{ruleId}")
    @PreAuthorize(Rbac.IS_ADMIN)
    public RuleResponse update(@PathVariable String ruleId, @Valid @RequestBody RuleInput in) {
        AlmPrincipal actor = currentUser.require();
        return RuleResponse.from(rules.update(actor, ruleId, in));
    }

    @PostMapping("/rules/{ruleId}:activate")
    @PreAuthorize(Rbac.IS_ADMIN)
    public RuleResponse activate(@PathVariable String ruleId) {
        AlmPrincipal actor = currentUser.require();
        return RuleResponse.from(rules.activate(actor, ruleId));
    }

    @PostMapping("/rules/{ruleId}:deprecate")
    @PreAuthorize(Rbac.IS_ADMIN)
    public RuleResponse deprecate(@PathVariable String ruleId) {
        AlmPrincipal actor = currentUser.require();
        return RuleResponse.from(rules.deprecate(actor, ruleId));
    }

    @PostMapping("/rules:evaluate")
    @PreAuthorize(Rbac.CAN_READ)
    @Operation(summary = "Evaluate the active rule set against a batch",
            description = "Called by the mapping engine as the low-cost synchronous first strategy.")
    public EvaluationResponse evaluate(@Valid @RequestBody EvaluationRequest request) {
        AlmPrincipal actor = currentUser.require();
        return new EvaluationResponse(
                rules.evaluate(actor.tenantId(), request.accounts(), request.activeMasterCodes()));
    }

    @PostMapping("/rules:simulate")
    @PreAuthorize(Rbac.IS_ADMIN)
    @Operation(summary = "Simulate a candidate rule set",
            description = "Writes nothing. Returns the match delta against the live rule set so the "
                    + "impact of a change is visible before activation.")
    public SimulationResult simulate(@Valid @RequestBody SimulationRequest request) {
        AlmPrincipal actor = currentUser.require();
        return rules.simulate(actor, request.sessionId(), request.accounts(),
                request.candidateRules(), request.activeMasterCodes());
    }
}
