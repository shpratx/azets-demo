import type {
  User, MappingSession, MappingSuggestion, Exception,
  MasterLedgerAccount, MappingRule, AuditEvent, SyncRecord,
  ValidationIssue, BulkFirm, KpiData, SlaMetric,
} from '../types';

// ─── Users ───────────────────────────────────────────────────────────────────
export const CURRENT_USER: User = {
  id: 'u1', name: 'Priya Sharma', email: 'priya.sharma@azets.com',
  role: 'FinanceManager', organisation: 'Azets', status: 'Active',
  lastLogin: '2026-09-01T09:14:00Z', activeSessions: 1, avatarInitials: 'PS',
};

export const USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Raj Patel', email: 'raj.patel@azets.com', role: 'Accountant', organisation: 'Azets', status: 'Active', lastLogin: '2026-09-01T08:30:00Z', activeSessions: 1, avatarInitials: 'RP' },
  { id: 'u3', name: 'Sarah Mitchell', email: 'sarah.mitchell@azets.com', role: 'Auditor', organisation: 'Azets', status: 'Active', lastLogin: '2026-08-31T16:00:00Z', activeSessions: 0, avatarInitials: 'SM' },
  { id: 'u4', name: 'James Muldoon', email: 'james.muldoon@muldoon.co.uk', role: 'Accountant', organisation: 'Muldoon & Co', status: 'Active', lastLogin: '2026-09-01T09:00:00Z', activeSessions: 1, avatarInitials: 'JM' },
  { id: 'u5', name: 'Claire Hartley', email: 'claire@hartleypartners.co.uk', role: 'Accountant', organisation: 'Hartley Partners', status: 'Active', lastLogin: '2026-08-18T14:00:00Z', activeSessions: 0, avatarInitials: 'CH' },
  { id: 'u6', name: 'Tom Barnes', email: 'tom.barnes@azets.com', role: 'Administrator', organisation: 'Azets', status: 'Active', lastLogin: '2026-08-30T10:00:00Z', activeSessions: 1, avatarInitials: 'TB' },
  { id: 'u7', name: 'Aisha Okonkwo', email: 'aisha.okonkwo@azets.com', role: 'FinanceManager', organisation: 'Azets', status: 'Active', lastLogin: '2026-08-29T11:00:00Z', activeSessions: 0, avatarInitials: 'AO' },
  { id: 'u8', name: 'Ben Walsh', email: 'b.walsh@redwoodacc.com', role: 'Accountant', organisation: 'Redwood Accounting', status: 'Suspended', lastLogin: '2026-08-04T11:30:00Z', activeSessions: 0, avatarInitials: 'BW' },
];

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const SESSIONS: MappingSession[] = [
  { id: 'A-2024-089', firmName: 'Muldoon & Co', uploadedAt: '2026-09-01T09:14:00Z', totalAccounts: 3847, autoMapped: 3621, autoMappedPct: 94.1, pendingReview: 226, errors: 0, status: 'InReview', duration: '—', financeManager: 'Priya Sharma' },
  { id: 'A-2024-081', firmName: 'Hartley Partners', uploadedAt: '2026-08-18T14:02:00Z', totalAccounts: 1204, autoMapped: 1198, autoMappedPct: 99.5, pendingReview: 0, errors: 0, status: 'Synced', duration: '1m 23s', financeManager: 'Priya Sharma' },
  { id: 'A-2024-077', firmName: 'Redwood Accounting', uploadedAt: '2026-08-04T11:30:00Z', totalAccounts: 892, autoMapped: 867, autoMappedPct: 97.2, pendingReview: 0, errors: 0, status: 'Synced', duration: '58s', financeManager: 'Aisha Okonkwo' },
  { id: 'A-2024-071', firmName: 'Palmer & Associates', uploadedAt: '2026-07-22T08:55:00Z', totalAccounts: 2310, autoMapped: 2101, autoMappedPct: 91.0, pendingReview: 0, errors: 0, status: 'Synced', duration: '2m 04s', financeManager: 'Priya Sharma' },
  { id: 'A-2024-063', firmName: 'Forrest & Co', uploadedAt: '2026-07-10T13:20:00Z', totalAccounts: 540, autoMapped: 521, autoMappedPct: 96.5, pendingReview: 0, errors: 2, status: 'Failed', duration: '—', financeManager: 'Aisha Okonkwo' },
];

// ─── Mapping suggestions ───────────────────────────────────────────────────
export const MAPPING_SUGGESTIONS: MappingSuggestion[] = [
  { id: 'm1', legacyCode: 'MUL-1001', legacyName: 'Cash at Bank', legacyType: 'Asset', suggestedMasterCode: 'AZT-1000', suggestedMasterName: 'Cash and Cash Equivalents', matchType: 'Rule-Based', confidence: 99, explanation: 'Exact name match via CASH_ACCOUNTS rule', status: 'Pending' },
  { id: 'm2', legacyCode: 'MUL-1002', legacyName: 'Accounts Receivable', legacyType: 'Asset', suggestedMasterCode: 'AZT-1100', suggestedMasterName: 'Trade Receivables', matchType: 'AI Semantic', confidence: 97, explanation: 'High semantic similarity — trade debtors pattern', status: 'Pending' },
  { id: 'm3', legacyCode: 'MUL-1050', legacyName: 'Stock on Hand', legacyType: 'Asset', suggestedMasterCode: 'AZT-1300', suggestedMasterName: 'Inventories', matchType: 'AI Semantic', confidence: 93, explanation: 'AI matched inventory category with 93% confidence', status: 'Pending' },
  { id: 'm4', legacyCode: 'MUL-2001', legacyName: 'Trade Creditors', legacyType: 'Liability', suggestedMasterCode: 'AZT-2000', suggestedMasterName: 'Trade Payables', matchType: 'Rule-Based', confidence: 98, explanation: 'CREDITOR_ACCOUNTS rule match', status: 'Accepted' },
  { id: 'm5', legacyCode: 'MUL-2500', legacyName: 'Deferred Revenue Legacy', legacyType: 'Liability', suggestedMasterCode: 'AZT-2400', suggestedMasterName: 'Deferred Income', matchType: 'Similarity', confidence: 82, explanation: 'Name similarity 82% — deferred revenue patterns', status: 'Pending' },
  { id: 'm6', legacyCode: 'MUL-2847', legacyName: 'Suspense Account Legacy', legacyType: 'Liability', suggestedMasterCode: 'AZT-5510', suggestedMasterName: 'Suspense — Clearing', matchType: 'AI Semantic', confidence: 68, explanation: 'Ambiguous — 3 possible matches (AZT-5510, AZT-5520, AZT-3010)', status: 'Flagged' },
  { id: 'm7', legacyCode: 'MUL-3100', legacyName: 'Sales Revenue', legacyType: 'Revenue', suggestedMasterCode: 'AZT-4000', suggestedMasterName: 'Revenue from Contracts', matchType: 'Rule-Based', confidence: 96, explanation: 'REVENUE_ACCOUNTS rule — top-level sales code', status: 'Pending' },
  { id: 'm8', legacyCode: 'MUL-7890', legacyName: 'Misc Overhead Allocations', legacyType: 'Expense', suggestedMasterCode: 'AZT-3010', suggestedMasterName: 'Other Operating Expenses', matchType: 'Similarity', confidence: 71, explanation: 'Low confidence — generic expense category, multiple candidates', status: 'Flagged' },
];

// ─── Exceptions ────────────────────────────────────────────────────────────
export const EXCEPTIONS: Exception[] = [
  { id: 'e1', priority: 'High', legacyCode: 'MUL-2847', legacyName: 'Suspense Account Legacy', exceptionType: 'Ambiguous Mapping', aiConfidence: 68, assignedTo: 'Raj Patel', ageHours: 2, sessionId: 'A-2024-089' },
  { id: 'e2', priority: 'High', legacyCode: 'MUL-4430', legacyName: 'Intercompany Loan', exceptionType: 'No Match', aiConfidence: 0, assignedTo: null, ageHours: 2, sessionId: 'A-2024-089' },
  { id: 'e3', priority: 'High', legacyCode: 'MUL-9999', legacyName: 'Legacy Clearing Account', exceptionType: 'Ambiguous Mapping', aiConfidence: 55, assignedTo: 'Raj Patel', ageHours: 3, sessionId: 'A-2024-089' },
  { id: 'e4', priority: 'Medium', legacyCode: 'MUL-1099', legacyName: 'Bank Charges', exceptionType: 'Missing Code', aiConfidence: 0, assignedTo: null, ageHours: 2, sessionId: 'A-2024-089' },
  { id: 'e5', priority: 'Medium', legacyCode: 'MUL-1099B', legacyName: 'Bank Charges (Duplicate)', exceptionType: 'Duplicate', aiConfidence: 0, assignedTo: null, ageHours: 2, sessionId: 'A-2024-089' },
  { id: 'e6', priority: 'Medium', legacyCode: 'MUL-5500', legacyName: 'R&D Expenditure', exceptionType: 'Ambiguous Mapping', aiConfidence: 72, assignedTo: null, ageHours: 1, sessionId: 'A-2024-089' },
  { id: 'e7', priority: 'Low', legacyCode: 'MUL-0001', legacyName: 'Opening Balance', exceptionType: 'Missing Code', aiConfidence: 0, assignedTo: null, ageHours: 4, sessionId: 'A-2024-089' },
  { id: 'e8', priority: 'Low', legacyCode: 'MUL-8800', legacyName: 'Tax Accrual', exceptionType: 'Ambiguous Mapping', aiConfidence: 74, assignedTo: null, ageHours: 1, sessionId: 'A-2024-089' },
];

// ─── Master Ledger ─────────────────────────────────────────────────────────
export const MASTER_LEDGER: MasterLedgerAccount[] = [
  { code: 'AZT-1000', name: 'Cash and Cash Equivalents', type: 'Asset', classification: 'Current Asset', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
  { code: 'AZT-1100', name: 'Trade Receivables', type: 'Asset', classification: 'Current Asset', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
  { code: 'AZT-1200', name: 'Prepayments', type: 'Asset', classification: 'Current Asset', parentCode: null, status: 'Active', lastModified: '2026-07-01' },
  { code: 'AZT-1300', name: 'Inventories', type: 'Asset', classification: 'Current Asset', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
  { code: 'AZT-1500', name: 'Property Plant Equipment', type: 'Asset', classification: 'Non-Current Asset', parentCode: null, status: 'Active', lastModified: '2026-06-01' },
  { code: 'AZT-2000', name: 'Trade Payables', type: 'Liability', classification: 'Current Liability', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
  { code: 'AZT-2400', name: 'Deferred Income', type: 'Liability', classification: 'Current Liability', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
  { code: 'AZT-3000', name: 'Share Capital', type: 'Equity', classification: 'Equity', parentCode: null, status: 'Active', lastModified: '2026-01-01' },
  { code: 'AZT-4000', name: 'Revenue from Contracts', type: 'Revenue', classification: 'Operating Revenue', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
  { code: 'AZT-5000', name: 'Cost of Sales', type: 'Expense', classification: 'Direct Cost', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
  { code: 'AZT-5510', name: 'Suspense — Clearing', type: 'Memo', classification: 'Clearing', parentCode: null, status: 'Active', lastModified: '2026-03-01' },
  { code: 'AZT-3010', name: 'Other Operating Expenses', type: 'Expense', classification: 'Indirect Cost', parentCode: null, status: 'Active', lastModified: '2026-08-14' },
];

// ─── Rules ─────────────────────────────────────────────────────────────────
export const RULES: MappingRule[] = [
  { id: 'RULE-001', priority: 1, name: 'Cash accounts mapping', condition: "code.startsWith('CASH') || name.includes('Cash')", action: 'AZT-1000', confidenceBoost: 15, status: 'Active', usedCount: 4821 },
  { id: 'RULE-002', priority: 2, name: 'Trade receivables', condition: "name.includes('Receivable') || name.includes('Debtor')", action: 'AZT-1100', confidenceBoost: 12, status: 'Active', usedCount: 3102 },
  { id: 'RULE-003', priority: 3, name: 'Trade creditors / payables', condition: "name.includes('Creditor') || name.includes('Payable')", action: 'AZT-2000', confidenceBoost: 12, status: 'Active', usedCount: 2980 },
  { id: 'RULE-004', priority: 4, name: 'Revenue top-level', condition: "type === 'Revenue' && !name.includes('Deferred')", action: 'AZT-4000', confidenceBoost: 10, status: 'Active', usedCount: 6443 },
  { id: 'RULE-005', priority: 5, name: 'Inventory / stock', condition: "name.includes('Stock') || name.includes('Inventor')", action: 'AZT-1300', confidenceBoost: 10, status: 'Active', usedCount: 1204 },
  { id: 'RULE-042', priority: 42, name: 'Suspense accounts', condition: "name.toLowerCase().includes('suspense')", action: 'AZT-5510', confidenceBoost: 5, status: 'Active', usedCount: 312 },
  { id: 'RULE-055', priority: 55, name: 'Legacy clearing (deprecated)', condition: "name.includes('Legacy') && type === 'Memo'", action: 'AZT-5510', confidenceBoost: 3, status: 'Deprecated', usedCount: 88 },
  { id: 'RULE-060', priority: 60, name: 'R&D draft rule', condition: "name.includes('R&D') || name.includes('Research')", action: 'AZT-3010', confidenceBoost: 8, status: 'Draft', usedCount: 0 },
];

// ─── Audit events ──────────────────────────────────────────────────────────
export const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'a1', occurredAt: '2026-09-01T09:14:00Z', actor: 'Priya Sharma', category: 'Upload', action: 'File uploaded', subjectId: 'A-2024-089', detail: 'muldoon-accounts.xlsx — 3,847 rows' },
  { id: 'a2', occurredAt: '2026-09-01T09:16:00Z', actor: 'System', category: 'Validation', action: 'Validation complete', subjectId: 'A-2024-089', detail: '22 errors resolved, 204 warnings' },
  { id: 'a3', occurredAt: '2026-09-01T09:18:00Z', actor: 'System', category: 'Mapping', action: 'AI mapping complete', subjectId: 'A-2024-089', detail: '3,621 auto-mapped, 226 flagged for review' },
  { id: 'a4', occurredAt: '2026-09-01T10:03:00Z', actor: 'Raj Patel', category: 'Override', action: 'Manual override applied', subjectId: 'MUL-2847', detail: 'MUL-2847 → AZT-5510 — Legacy suspense reclassified' },
  { id: 'a5', occurredAt: '2026-09-01T11:22:00Z', actor: 'Raj Patel', category: 'Override', action: 'Batch overrides completed', subjectId: 'A-2024-089', detail: '143 of 226 exceptions resolved' },
  { id: 'a6', occurredAt: '2026-09-01T12:10:00Z', actor: 'Raj Patel', category: 'Review', action: 'Review session completed', subjectId: 'A-2024-089', detail: 'All 226 exceptions resolved' },
  { id: 'a7', occurredAt: '2026-09-01T13:22:00Z', actor: 'System', category: 'Report', action: 'PDF audit report generated', subjectId: 'A-2024-089', detail: 'audit-report-A-2024-089.pdf' },
  { id: 'a8', occurredAt: '2026-09-01T13:47:00Z', actor: 'Priya Sharma', category: 'Approval', action: 'Approved for Cozone sync', subjectId: 'A-2024-089', detail: 'Signed off by Finance Manager' },
];

// ─── Sync records ──────────────────────────────────────────────────────────
export const SYNC_RECORDS: SyncRecord[] = [
  { id: 's1', firmName: 'Hartley Partners', syncedAt: '2026-08-18T16:30:00Z', accountsExported: 1204, failures: 0, duration: '1m 23s', status: 'Success' },
  { id: 's2', firmName: 'Redwood Accounting', syncedAt: '2026-08-04T13:45:00Z', accountsExported: 892, failures: 0, duration: '58s', status: 'Success' },
  { id: 's3', firmName: 'Palmer & Associates', syncedAt: '2026-07-22T11:10:00Z', accountsExported: 2310, failures: 0, duration: '2m 04s', status: 'Success' },
  { id: 's4', firmName: 'Forrest & Co', syncedAt: '2026-07-10T15:00:00Z', accountsExported: 538, failures: 2, duration: '—', status: 'Partial' },
];

// ─── Validation issues ─────────────────────────────────────────────────────
export const VALIDATION_ISSUES: ValidationIssue[] = [
  { row: 47, accountCode: 'MUL-1099B', accountName: 'Bank Charges (Alt)', issue: 'Duplicate account code — MUL-1099 already exists', severity: 'Warning' },
  { row: 102, accountCode: 'MUL-3301', accountName: 'Sales — North Region', issue: 'Missing parent code; root-level assignment assumed', severity: 'Warning' },
  { row: 215, accountCode: 'MUL-0001', accountName: 'Opening Balance', issue: 'Account code format non-standard (expected MUL-XXXX)', severity: 'Warning' },
  { row: 388, accountCode: 'MUL-9999', accountName: 'Legacy Clearing Account', issue: 'Account type not specified; defaulting to Memo', severity: 'Warning' },
  { row: 412, accountCode: 'MUL-5599', accountName: '', issue: 'Account name is empty', severity: 'Error' },
];

// ─── Bulk firms ────────────────────────────────────────────────────────────
export const BULK_FIRMS: BulkFirm[] = [
  { id: 'b1', firmName: 'Muldoon & Co', fileName: 'muldoon-accounts.xlsx', format: 'XLSX', status: 'Complete', progress: 100, accountsTotal: 3847, accountsDone: 3847 },
  { id: 'b2', firmName: 'Hartley Partners', fileName: 'hartley-chart-of-accounts.csv', format: 'CSV', status: 'Complete', progress: 100, accountsTotal: 1204, accountsDone: 1204 },
  { id: 'b3', firmName: 'Redwood Accounting', fileName: 'redwood-accounts.xlsx', format: 'XLSX', status: 'Processing', progress: 62, accountsTotal: 892, accountsDone: 553 },
  { id: 'b4', firmName: 'Palmer & Associates', fileName: 'palmer-ledger.xml', format: 'XML', status: 'Pending', progress: 0, accountsTotal: 2310, accountsDone: 0 },
];

// ─── KPIs ──────────────────────────────────────────────────────────────────
export const KPI_DATA: KpiData = {
  totalSessions: 47,
  accountsProcessed: 48293,
  avgAutoMapRate: 93.4,
  avgErrorRate: 1.8,
  avgProcessingTime: '4m 12s',
  cozoneSync: 43,
};

// ─── SLA metrics ───────────────────────────────────────────────────────────
export const SLA_METRICS: SlaMetric[] = [
  { name: 'Processing Speed', target: '< 60s', actual: '42s avg', met: true },
  { name: 'System Uptime', target: '99.9%', actual: '99.97%', met: true },
  { name: 'Error Rate', target: '< 2%', actual: '1.8%', met: true },
  { name: 'Sync Success Rate', target: '> 99%', actual: '100%', met: true },
];
