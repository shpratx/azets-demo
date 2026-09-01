import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, Card, Chip, DataTable, Tr, Td, PageHeader, Ann, TabBar } from '../components/ui';
import { SESSIONS } from '../data/mock';
import type { SessionStatus } from '../types';

const statusVariant: Record<SessionStatus, string> = {
  Uploading: 'neutral', Validating: 'neutral', Mapping: 'info', InReview: 'warning',
  Approved: 'brand', Syncing: 'info', Synced: 'success', Failed: 'danger',
};

export default function HistoryPortalPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState('Summary');

  const filtered = SESSIONS.filter(s =>
    (!search || s.firmName.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())) &&
    (status === 'All' || s.status === status)
  );
  const selectedSession = SESSIONS.find(s => s.id === selected);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Mapping History Portal"
        subtitle="View, search and audit all past mapping sessions"
        actions={
          <>
            <span className="text-sm text-ink-600">Showing {filtered.length} of {SESSIONS.length} sessions</span>
            <Ann>F2.1 History Portal</Ann>
            <Button variant="ghost" size="sm">↓ Export list</Button>
          </>
        }
      />

      {/* Filters */}
      <Card className="py-3 px-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by session ID or firm name…"
              className="w-full h-9 pl-8 pr-3 border border-border rounded-control text-sm focus-visible:outline-2 focus-visible:outline-focus" />
          </div>
          <input type="date" defaultValue="2026-07-01"
            className="h-9 border border-border rounded-control px-3 text-sm focus-visible:outline-2 focus-visible:outline-focus" />
          <input type="date" defaultValue="2026-09-01"
            className="h-9 border border-border rounded-control px-3 text-sm focus-visible:outline-2 focus-visible:outline-focus" />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
            {['All', 'InReview', 'Synced', 'Failed'].map(o => <option key={o}>{o}</option>)}
          </select>
          <Ann>F2.1.2 Historical Search</Ann>
        </div>
      </Card>

      <div className="flex gap-5">
        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <DataTable headers={['Session', 'Firm', 'Date', 'Accounts', 'Auto-Mapped', 'Overrides', 'Status', 'Duration', 'Actions']}>
            {filtered.map(s => (
              <Tr key={s.id} onClick={() => setSelected(s.id)} highlight={selected === s.id}>
                <Td><strong>{s.id}</strong></Td>
                <Td>{s.firmName}</Td>
                <Td className="tabular-nums text-ink-400 text-xs">
                  {new Date(s.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Td>
                <Td>{s.totalAccounts.toLocaleString()}</Td>
                <Td>{s.autoMappedPct}%</Td>
                <Td>{s.pendingReview > 0 ? s.pendingReview : '0'}</Td>
                <Td><Chip variant={statusVariant[s.status] as any}>{s.status}</Chip></Td>
                <Td className="tabular-nums">{s.duration}</Td>
                <Td>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(s.id); }}>Details</Button>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate('/audit'); }}>PDF</Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </DataTable>
        </div>

        {/* Investigation panel */}
        {selectedSession && (
          <div className="w-72 flex-shrink-0">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-ink-950">Session {selectedSession.id}</h4>
                <div className="flex items-center gap-1">
                  <Ann>F2.1.4</Ann>
                  <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-800 text-lg leading-none ml-1">×</button>
                </div>
              </div>
              <TabBar tabs={['Summary', 'Audit Events']} active={detailTab} onChange={setDetailTab} />
              {detailTab === 'Summary' && (
                <div className="flex flex-col gap-2">
                  {[
                    { l: 'Firm', v: selectedSession.firmName },
                    { l: 'Uploaded', v: new Date(selectedSession.uploadedAt).toLocaleDateString('en-GB') },
                    { l: 'Total Accounts', v: selectedSession.totalAccounts.toLocaleString() },
                    { l: 'Auto-Mapped', v: `${selectedSession.autoMappedPct}%` },
                    { l: 'Manual Overrides', v: selectedSession.pendingReview },
                    { l: 'Status', v: selectedSession.status },
                    { l: 'Duration', v: selectedSession.duration },
                  ].map(f => (
                    <div key={f.l} className="flex justify-between text-sm">
                      <span className="text-ink-400">{f.l}</span>
                      <span className="font-medium text-ink-950">{f.v}</span>
                    </div>
                  ))}
                  <Button variant="primary" size="sm" fullWidth className="mt-3" onClick={() => navigate('/audit')}>View Full Report →</Button>
                </div>
              )}
              {detailTab === 'Audit Events' && (
                <div className="text-xs text-ink-600 flex flex-col gap-2">
                  {['Upload', 'Validation', 'AI Mapping', 'Manual Review', 'Cozone Sync'].map(e => (
                    <div key={e} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      {e}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
