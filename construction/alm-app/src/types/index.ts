// ─── Domain Types ────────────────────────────────────────────────────────────

export type Role = 'FinanceManager' | 'Accountant' | 'Auditor' | 'Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organisation: string;
  status: 'Active' | 'Suspended' | 'Pending';
  lastLogin: string;
  activeSessions: number;
  avatarInitials: string;
}

export interface MappingSession {
  id: string;
  firmName: string;
  uploadedAt: string;
  totalAccounts: number;
  autoMapped: number;
  autoMappedPct: number;
  pendingReview: number;
  errors: number;
  status: SessionStatus;
  duration: string;
  financeManager: string;
}

export type SessionStatus =
  | 'Uploading'
  | 'Validating'
  | 'Mapping'
  | 'InReview'
  | 'Approved'
  | 'Syncing'
  | 'Synced'
  | 'Failed';

export interface LegacyAccount {
  id: string;
  legacyCode: string;
  legacyName: string;
  accountType: string;
  parentCode: string | null;
  currency: string;
}

export interface MappingSuggestion {
  id: string;
  legacyCode: string;
  legacyName: string;
  legacyType: string;
  suggestedMasterCode: string;
  suggestedMasterName: string;
  matchType: 'Rule-Based' | 'AI Semantic' | 'Similarity';
  confidence: number;
  explanation: string;
  status: 'Pending' | 'Accepted' | 'Overridden' | 'Flagged';
}

export interface Exception {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  legacyCode: string;
  legacyName: string;
  exceptionType: 'Ambiguous Mapping' | 'Missing Code' | 'Duplicate' | 'No Match' | 'System Error';
  aiConfidence: number;
  assignedTo: string | null;
  ageHours: number;
  sessionId: string;
}

export interface MasterLedgerAccount {
  code: string;
  name: string;
  type: AccountType;
  classification: string;
  parentCode: string | null;
  status: 'Active' | 'Inactive';
  lastModified: string;
}

export type AccountType =
  | 'Asset'
  | 'Liability'
  | 'Equity'
  | 'Revenue'
  | 'Expense'
  | 'Memo';

export interface MappingRule {
  id: string;
  priority: number;
  name: string;
  condition: string;
  action: string;
  confidenceBoost: number;
  status: 'Active' | 'Draft' | 'Deprecated';
  usedCount: number;
}

export interface AuditEvent {
  id: string;
  occurredAt: string;
  actor: string;
  category: string;
  action: string;
  subjectId: string;
  detail: string;
}

export interface SyncRecord {
  id: string;
  firmName: string;
  syncedAt: string;
  accountsExported: number;
  failures: number;
  duration: string;
  status: 'Success' | 'Partial' | 'Failed';
}

export interface ValidationIssue {
  row: number;
  accountCode: string;
  accountName: string;
  issue: string;
  severity: 'Warning' | 'Error';
}

export interface BulkFirm {
  id: string;
  firmName: string;
  fileName: string;
  format: 'CSV' | 'XLSX' | 'XML';
  status: 'Pending' | 'Processing' | 'Complete' | 'Failed';
  progress: number;
  accountsTotal: number;
  accountsDone: number;
}

export interface KpiData {
  totalSessions: number;
  accountsProcessed: number;
  avgAutoMapRate: number;
  avgErrorRate: number;
  avgProcessingTime: string;
  cozoneSync: number;
}

export interface SlaMetric {
  name: string;
  target: string;
  actual: string;
  met: boolean;
}
