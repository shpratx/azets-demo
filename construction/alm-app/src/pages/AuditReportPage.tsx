import { Button, Card, Chip, DataTable, Tr, Td, PageHeader, Ann } from '../components/ui';
import { AUDIT_EVENTS } from '../data/mock';

export default function AuditReportPage() {
  const categoryIcon: Record<string, string> = {
    Upload: '📤', Validation: '✅', Mapping: '⚡', Override: '✏️',
    Review: '👁', Report: '📄', Approval: '✓',
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        title="Audit Reports — Session A-2024-089"
        subtitle="Muldoon & Co · 01 Sep 2026 · Finance Manager: Priya Sharma"
        actions={<Ann>F1.7 Audit Reporting</Ann>}
      />

      {/* Session summary */}
      <Card>
        <h3 className="text-base font-semibold text-ink-950 mb-4">Session Summary</h3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: 'Session ID',         v: 'A-2024-089' },
            { l: 'Firm',               v: 'Muldoon & Co' },
            { l: 'Date',               v: '01 Sep 2026' },
            { l: 'Finance Manager',    v: 'Priya Sharma' },
            { l: 'Total Accounts',     v: '3,847' },
            { l: 'Auto-Mapped',        v: '3,621',  ok: true },
            { l: 'Manual Overrides',   v: '226',    warn: true },
            { l: 'Sync Status',        v: 'Pending' },
          ].map(f => (
            <div key={f.l} className="bg-mist-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-0.5">{f.l}</p>
              <p className={['text-sm font-semibold', f.ok ? 'text-success' : f.warn ? 'text-warning' : 'text-ink-950'].join(' ')}>{f.v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Download cards */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📄</span>
            <div>
              <h4 className="text-base font-semibold text-ink-950">PDF Audit Report</h4>
              <p className="text-xs text-ink-400">Full compliance report</p>
            </div>
            <Ann className="ml-auto">F1.7.4 PDF</Ann>
          </div>
          <ul className="flex flex-col gap-1 mb-5">
            {['All 3,847 mapping decisions with confidence scores', '226 manual overrides with reasons and approver', 'Full audit event timeline', 'Session metadata and FM sign-off', 'GDPR-compliant — no raw PII exposed'].map(i => (
              <li key={i} className="text-xs text-ink-600 flex items-start gap-1.5">
                <span className="text-brand-500 mt-0.5 flex-shrink-0">✓</span> {i}
              </li>
            ))}
          </ul>
          <Button variant="primary" fullWidth>↓ Generate PDF</Button>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📊</span>
            <div>
              <h4 className="text-base font-semibold text-ink-950">CSV Data Export</h4>
              <p className="text-xs text-ink-400">Machine-readable mapping data</p>
            </div>
            <Ann className="ml-auto">F1.7.5 CSV</Ann>
          </div>
          <ul className="flex flex-col gap-1 mb-5">
            {['legacy_code, legacy_name, master_code, master_name', 'confidence_score, match_type', 'status (auto/override)', 'override_reason, approved_by, approved_at', 'session_id, firm_name, upload_date'].map(i => (
              <li key={i} className="text-xs text-ink-400 font-mono flex items-start gap-1.5">
                <span className="text-ink-300 flex-shrink-0">–</span> {i}
              </li>
            ))}
          </ul>
          <Button variant="secondary" fullWidth>↓ Export CSV</Button>
        </Card>
      </div>

      {/* Audit event timeline */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-ink-950">Audit Event Timeline</h3>
          <Ann>F1.7.2 Override Audit</Ann>
          <Ann>F1.7.3 Timeline</Ann>
        </div>
        <div className="flex flex-col gap-0">
          {AUDIT_EVENTS.map((evt, i) => (
            <div key={evt.id} className="flex gap-4 relative">
              {/* Timeline line */}
              <div className="flex flex-col items-center w-8 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-brand-100 border-2 border-brand-500 flex items-center justify-center text-sm z-10">
                  {categoryIcon[evt.category] ?? '•'}
                </div>
                {i < AUDIT_EVENTS.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1 mb-1 min-h-[24px]" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-baseline gap-3 mb-0.5">
                  <span className="text-xs font-bold text-ink-950 tabular-nums">
                    {new Date(evt.occurredAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Chip variant={evt.category === 'Override' ? 'warning' : evt.category === 'Approval' ? 'success' : 'neutral'} dot={false} className="text-[10px]">
                    {evt.category}
                  </Chip>
                  <span className="text-xs text-ink-400">{evt.actor}</span>
                </div>
                <p className="text-sm font-semibold text-ink-950">{evt.action}</p>
                <p className="text-xs text-ink-600 mt-0.5">{evt.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Override table */}
      <div>
        <h3 className="text-base font-semibold text-ink-950 mb-3">Manual Overrides (226)</h3>
        <DataTable headers={['Legacy Code', 'Original Suggestion', 'Final Mapping', 'Approved By', 'Reason', 'Timestamp']}>
          {[
            { lc: 'MUL-2847', orig: 'AZT-5520', final: 'AZT-5510', by: 'Raj Patel', reason: 'Legacy suspense reclassified per Muldoon COA memo', ts: '10:03' },
            { lc: 'MUL-4430', orig: 'No match', final: 'AZT-2000', by: 'Raj Patel', reason: 'Intercompany loan mapped to trade payables per CFO instruction', ts: '10:47' },
            { lc: 'MUL-9999', orig: 'AZT-3010', final: 'AZT-5510', by: 'Priya Sharma', reason: 'Legacy clearing account — corrected to clearing memo account', ts: '11:05' },
            { lc: 'MUL-0001', orig: 'AZT-9900', final: 'AZT-3000', by: 'Raj Patel', reason: 'Opening balance mapped to share capital per historical records', ts: '11:14' },
          ].map(r => (
            <Tr key={r.lc}>
              <Td><code className="bg-mist-100 px-1.5 py-0.5 rounded text-xs font-mono">{r.lc}</code></Td>
              <Td className="text-xs text-ink-400">{r.orig}</Td>
              <Td><code className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-mono">{r.final}</code></Td>
              <Td className="text-sm">{r.by}</Td>
              <Td className="text-xs text-ink-600 max-w-[200px]">{r.reason}</Td>
              <Td className="tabular-nums text-ink-400 text-xs">01 Sep 2026 · {r.ts}</Td>
            </Tr>
          ))}
        </DataTable>
        <p className="text-xs text-ink-400 mt-2">Showing 4 of 226 overrides · Download CSV for full dataset</p>
      </div>
    </div>
  );
}
