package com.azets.alm.intake.domain;

import com.azets.alm.common.enums.Severity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/** LLD 1.10 and 2.4. Every issue names its source row so the user can find it in their own file. */
@Entity
@Table(name = "validation_issue")
public class ValidationIssue {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id = UUID.randomUUID();

    @Column(name = "session_id", length = 20, nullable = false)
    private String sessionId;

    @Column(name = "row_number", nullable = false)
    private int row;

    @Column(name = "account_code", length = 50)
    private String accountCode;

    @Column(name = "account_name", length = 300)
    private String accountName;

    @Column(name = "issue", length = 500, nullable = false)
    private String issue;

    @Column(name = "severity", length = 20, nullable = false)
    private Severity severity;

    protected ValidationIssue() {
    }

    public ValidationIssue(String sessionId, int row, String accountCode, String accountName,
                           String issue, Severity severity) {
        this.sessionId = sessionId;
        this.row = row;
        this.accountCode = accountCode;
        this.accountName = accountName;
        this.issue = issue;
        this.severity = severity;
    }

    public static ValidationIssue error(String sessionId, int row, String code, String name, String issue) {
        return new ValidationIssue(sessionId, row, code, name, issue, Severity.ERROR);
    }

    public static ValidationIssue warning(String sessionId, int row, String code, String name, String issue) {
        return new ValidationIssue(sessionId, row, code, name, issue, Severity.WARNING);
    }

    public UUID getId() {
        return id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public int getRow() {
        return row;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public String getAccountName() {
        return accountName;
    }

    public String getIssue() {
        return issue;
    }

    public Severity getSeverity() {
        return severity;
    }
}
