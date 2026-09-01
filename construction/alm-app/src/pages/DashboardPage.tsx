import { useNavigate } from 'react-router-dom';
import { SESSIONS } from '../data/mock';
import { Button, StatsCard, Card, Chip, AlertBanner, ProgressBar, DataTable, Tr, Td, PageHeader } from '../components/ui';
import type { SessionStatus } from '../types';

const statusChip: Record<SessionStatus, [string, string]> = {
  Uploading:   ['neutral',  'Uploading'],
  Validating:  ['neutral',  'Validating'],
  Mapping:     ['info',     'Mapping'],
  InReview:    ['warning',  'In Review'],
  Approved:    ['brand',    'Approved'],
  Syncing:     ['info',     'Syncing'],
  Synced:      ['success',  'Synced to Cozone'],
  Failed:      ['danger',   'Failed'],
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const current = SESSIONS[0];

  const steps = [
    { label: 'Upload & Validation', pct: 100, color: 'bg-success' },
    { label: 'AI Mapping Engine',   pct: 100, color: 'bg-success' },
    { label: 'Manual Review',       pct: 41,  color: 'bg-brand-500', note: '226 remaining' },
    { label: 'Cozone Sync',         pct: 0,   color: 'bg-brand-500', note: 'Waiting' },
    { label: 'Audit Report',        pct: 0,   color: 'bg-brand-500', note: 'Waiting' },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        title="Dashboard"
        subtitle={`Overview as of 01 Sep 2026 · Muldoon Acquisition · Session #${current.id}`}
        actions={
          <>
            <Button variant="ghost" size="sm">↓ Export Report</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/upload')}>+ New Upload</Button>
          </>
        }
      />

      <AlertBanner
        title="7 mappings require manual review"
        body="Ambiguous account codes flagged in the last processing run — action needed before Cozone sync can proceed."
        action={<Button size="sm" onClick={() => navigate('/exceptions')}>Review now →</Button>}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard label="Accounts Processed" value="3,847" delta="▲ 12% vs last session" deltaUp accent="brand" />
        <StatsCard label="Auto-Mapped (AI)" value="3,621" delta="▲ 94.1% confidence avg" deltaUp accent="success" />
        <StatsCard label="Pending Review" value="226" delta="Requires human input" accent="warning" />
        <StatsCard label="Mapping Error Rate" value="1.8%" delta="▼ vs 15% manual baseline" deltaUp accent="neutral" />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session progress */}
        <Card>
          <h3 className="text-base font-semibold text-ink-950 mb-5">Session Progress — Muldoon Acquisition</h3>
          <div className="flex flex-col gap-4">
            {steps.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm text-ink-600 mb-1.5">
                  <span>{s.label}</span>
                  <span className={s.pct === 100 ? 'text-success font-semibold' : s.pct === 0 ? 'text-ink-400' : 'text-warning font-semibold'}>
                    {s.pct === 100 ? 'Complete' : s.pct === 0 ? (s.note || 'Waiting') : `In Progress — ${s.note}`}
                  </span>
                </div>
                <ProgressBar value={s.pct} color={s.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Confidence distribution */}
        <Card>
          <h3 className="text-base font-semibold text-ink-950 mb-5">Mapping Confidence Distribution</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: 'High confidence ≥95%',   count: '2,843 accounts', pct: 74, color: 'bg-success' },
              { label: 'Medium 75–94%',           count: '778 accounts',   pct: 20, color: 'bg-brand-500' },
              { label: 'Low <75% (needs review)', count: '226 accounts',   pct: 6,  color: 'bg-warning' },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-sm text-ink-600 mb-1">
                  <span>{r.label}</span><span>{r.count}</span>
                </div>
                <ProgressBar value={r.pct} height="h-3" color={r.color} />
              </div>
            ))}
          </div>
          <div className="mt-5 bg-brand-100 rounded-xl p-4">
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Target KPI</p>
            <p className="text-sm text-ink-800">
              Error rate target: <strong>&lt;2%</strong> · Current: <strong className="text-success">1.8% ✓</strong>
            </p>
          </div>
        </Card>
      </div>

      {/* Recent sessions table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-950">Recent Mapping Sessions</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>View all history →</Button>
        </div>
        <DataTable headers={['Session', 'Firm', 'Uploaded', 'Accounts', 'Auto-Mapped', 'Pending', 'Status', 'Actions']}>
          {SESSIONS.map(s => {
            const [variant, label] = statusChip[s.status];
            return (
              <Tr key={s.id}>
                <Td><strong>{s.id}</strong></Td>
                <Td>{s.firmName}</Td>
                <Td className="text-ink-400 tabular-nums">{new Date(s.uploadedAt).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</Td>
                <Td>{s.totalAccounts.toLocaleString()}</Td>
                <Td>{s.autoMapped.toLocaleString()} ({s.autoMappedPct}%)</Td>
                <Td className={s.pendingReview > 0 ? 'text-warning font-semibold' : ''}>{s.pendingReview > 0 ? s.pendingReview : '—'}</Td>
                <Td><Chip variant={variant as any}>{label}</Chip></Td>
                <Td>
                  <Button variant="ghost" size="sm" onClick={() => navigate(s.status === 'InReview' ? '/mapping' : '/history')}>
                    {s.status === 'InReview' ? 'Open →' : 'View report'}
                  </Button>
                </Td>
              </Tr>
            );
          })}
        </DataTable>
      </div>
    </div>
  );
}
