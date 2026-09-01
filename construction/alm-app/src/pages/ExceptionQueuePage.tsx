import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Chip, ConfidencePill, DataTable, Tr, Td, PageHeader, Ann } from '../components/ui';
import { EXCEPTIONS } from '../data/mock';
import type { Exception } from '../types';

const priorityVariant = { High: 'danger', Medium: 'warning', Low: 'neutral' } as const;

export default function ExceptionQueuePage() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState<Exception | null>(null);
  const [assignee, setAssignee] = useState('Raj Patel');

  const types = ['All', 'Ambiguous Mapping', 'Missing Code', 'Duplicate', 'No Match', 'System Error'];
  const filtered = typeFilter === 'All' ? EXCEPTIONS : EXCEPTIONS.filter(e => e.exceptionType === typeFilter);

  const counts = {
    'Ambiguous Mapping': EXCEPTIONS.filter(e => e.exceptionType === 'Ambiguous Mapping').length,
    'Missing Code': EXCEPTIONS.filter(e => e.exceptionType === 'Missing Code').length,
    'Duplicate': EXCEPTIONS.filter(e => e.exceptionType === 'Duplicate').length,
    'No Match': EXCEPTIONS.filter(e => e.exceptionType === 'No Match').length,
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Exception Queue"
        subtitle="Ambiguous, unmatched and problem accounts requiring manual attention"
        actions={
          <>
            <span className="bg-danger text-white text-xs font-bold px-3 py-1 rounded-pill">{EXCEPTIONS.length} items</span>
            <Ann>F1.4 Exception Mgmt</Ann>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="bg-canvas border border-border rounded-card shadow-1 p-5 cursor-pointer hover:border-ink-400 transition-colors" onClick={() => setTypeFilter(k)}>
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2 truncate">{k}</p>
            <p className="text-3xl font-semibold text-ink-950">{v}</p>
          </div>
        ))}
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={['px-4 py-2 rounded-pill text-sm font-semibold border transition-colors', t === typeFilter ? 'bg-ink-950 text-white border-ink-950' : 'bg-canvas text-ink-600 border-border hover:border-ink-400'].join(' ')}>
            {t} {t !== 'All' && counts[t as keyof typeof counts] != null ? `(${counts[t as keyof typeof counts]})` : ''}
          </button>
        ))}
      </div>

      {/* Assignment + bulk actions */}
      <Card className="py-3 px-5">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="text-sm font-semibold text-ink-800">Bulk assignment:</p>
          <select value={assignee} onChange={e => setAssignee(e.target.value)}
            className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
            {['Raj Patel', 'Priya Sharma', 'Sarah Mitchell'].map(u => <option key={u}>{u}</option>)}
          </select>
          <Button variant="secondary" size="sm">Assign selected</Button>
          <div className="flex-1" />
          <Ann>F1.4.5 Assignment</Ann>
          <Button variant="ghost" size="sm">Bulk escalate</Button>
        </div>
      </Card>

      {/* Main layout: table + detail panel */}
      <div className="flex gap-5">
        <div className="flex-1 overflow-hidden">
          <DataTable headers={['Priority', 'Code', 'Account Name', 'Exception Type', 'AI Confidence', 'Assigned To', 'Age (hrs)', 'Actions']}>
            {filtered.map(ex => (
              <Tr key={ex.id} onClick={() => setSelected(ex)} highlight={selected?.id === ex.id}>
                <Td><Chip variant={priorityVariant[ex.priority]}>{ex.priority}</Chip></Td>
                <Td><code className="bg-mist-100 px-1.5 py-0.5 rounded text-xs font-mono">{ex.legacyCode}</code></Td>
                <Td className="font-medium">{ex.legacyName}</Td>
                <Td><Chip variant={ex.exceptionType === 'Ambiguous Mapping' ? 'warning' : ex.exceptionType === 'No Match' ? 'danger' : 'neutral'} dot={false} className="text-[10px]">{ex.exceptionType}</Chip></Td>
                <Td>{ex.aiConfidence > 0 ? <ConfidencePill value={ex.aiConfidence} /> : <span className="text-ink-400 text-xs">—</span>}</Td>
                <Td className="text-sm">{ex.assignedTo ?? <span className="text-ink-400">Unassigned</span>}</Td>
                <Td className="tabular-nums">{ex.ageHours}h</Td>
                <Td>
                  <Button variant="primary" size="sm" onClick={e => { e.stopPropagation(); navigate('/workbench'); }}>
                    Resolve
                  </Button>
                </Td>
              </Tr>
            ))}
          </DataTable>
        </div>

        {/* Detail flyout */}
        {selected && (
          <div className="w-80 flex-shrink-0 flex flex-col gap-3">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-ink-950">Exception Detail</h4>
                <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-800 text-lg leading-none">×</button>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { l: 'Legacy Code', v: selected.legacyCode },
                  { l: 'Account Name', v: selected.legacyName },
                  { l: 'Type', v: selected.exceptionType },
                  { l: 'Priority', v: selected.priority },
                  { l: 'AI Confidence', v: selected.aiConfidence > 0 ? `${selected.aiConfidence}%` : 'N/A' },
                  { l: 'Assigned To', v: selected.assignedTo ?? 'Unassigned' },
                  { l: 'Age', v: `${selected.ageHours} hours` },
                ].map(f => (
                  <div key={f.l} className="flex flex-col gap-0.5">
                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide">{f.l}</p>
                    <p className="text-sm text-ink-950">{f.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-xs font-bold text-yellow-800 mb-1">AI Reasoning</p>
                <p className="text-xs text-yellow-700">Multiple candidate accounts found in master ledger with overlapping semantic patterns. Confidence below 75% threshold — routed for manual review.</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/workbench')}>Resolve in Workbench →</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
