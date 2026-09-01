import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, Card, Chip, ConfidencePill, PageHeader, ProgressBar, Ann } from '../components/ui';
import { EXCEPTIONS } from '../data/mock';

export default function ManualWorkbenchPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(EXCEPTIONS[0].id);
  const [overrideReason, setOverrideReason] = useState('');
  const [search, setSearch] = useState('');
  const [done, setDone] = useState<Set<string>>(new Set());

  const current = EXCEPTIONS.find(e => e.id === selected)!;
  const searchResults = [
    { code: 'AZT-5510', name: 'Suspense — Clearing', score: 91 },
    { code: 'AZT-5520', name: 'Suspense — Intercompany', score: 78 },
    { code: 'AZT-3010', name: 'Other Operating Expenses', score: 61 },
    { code: 'AZT-9900', name: 'Unallocated — Pending Review', score: 44 },
    { code: 'AZT-2999', name: 'Clearing Account', score: 38 },
  ].filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase()));

  const saveMapping = () => {
    if (!overrideReason.trim()) return;
    setDone(prev => new Set(prev).add(selected));
    setOverrideReason('');
    const next = EXCEPTIONS.find(e => e.id !== selected && !done.has(e.id));
    if (next) setSelected(next.id);
  };

  const goToExceptions = () => navigate('/exceptions');

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-128px)]">
      <PageHeader
        title="Manual Mapping Workbench"
        subtitle="Session A-2024-089 · Muldoon & Co"
        actions={
          <>
            <span className="text-sm text-ink-600">{EXCEPTIONS.length - done.size} remaining · {done.size} mapped this session</span>
            <Ann>F1.5 Manual Workbench</Ann>
          </>
        }
      />

      <div className="flex gap-5 flex-1 overflow-hidden">
        {/* Left: Review Queue */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-bold text-ink-400 uppercase tracking-widest px-1">Review Queue ({EXCEPTIONS.length})</p>
          {EXCEPTIONS.map(ex => (
            <button
              key={ex.id}
              onClick={() => setSelected(ex.id)}
              className={[
                'text-left p-4 rounded-xl border transition-all',
                ex.id === selected ? 'border-brand-500 bg-brand-100' : 'border-border bg-canvas hover:border-ink-400',
                done.has(ex.id) ? 'opacity-50' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-mono bg-mist-100 px-1.5 py-0.5 rounded">{ex.legacyCode}</code>
                <ConfidencePill value={ex.aiConfidence || 0} />
              </div>
              <p className="text-sm font-medium text-ink-950 truncate">{ex.legacyName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Chip
                  variant={ex.exceptionType === 'Ambiguous Mapping' ? 'warning' : ex.exceptionType === 'No Match' ? 'danger' : 'neutral'}
                  dot={false}
                  className="text-[10px]"
                >
                  {ex.exceptionType}
                </Chip>
                {done.has(ex.id) && <Chip variant="success" dot={false} className="text-[10px]">Mapped</Chip>}
              </div>
            </button>
          ))}
        </div>

        {/* Right: Account detail + mapping */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4">
          <Card>
            <h3 className="text-base font-semibold text-ink-950 mb-4">
              Map Account — {current.legacyCode}: {current.legacyName}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { l: 'Legacy Code',    v: current.legacyCode },
                { l: 'Account Name',   v: current.legacyName },
                { l: 'Exception Type', v: current.exceptionType },
                { l: 'AI Confidence',  v: `${current.aiConfidence}%` },
                { l: 'Priority',       v: current.priority },
                { l: 'Session',        v: current.sessionId },
              ].map(f => (
                <div key={f.l} className="bg-mist-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-0.5">{f.l}</p>
                  <p className="text-sm font-medium text-ink-950">{f.v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* AI suggestion */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-ink-950">AI Top Suggestion</h4>
              <Ann>F1.5.2 Manual Selection</Ann>
            </div>
            <div className="bg-mist-50 border border-border rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <code className="text-sm font-mono text-brand-700">AZT-5510</code>
                <span className="text-sm text-ink-600 ml-2">Suspense — Clearing</span>
                <p className="text-xs text-ink-400 mt-1">Ambiguous — 3 possible matches with confidence 68%</p>
              </div>
              <div className="flex items-center gap-3">
                <ConfidencePill value={68} />
                <Button variant="ghost" size="sm">Accept AI suggestion</Button>
              </div>
            </div>
          </Card>

          {/* Manual search */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-ink-950">Search Azets Master Ledger</h4>
              <Ann>F1.5.3 Ledger Search</Ann>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by code or name…"
                className="w-full h-10 pl-8 pr-3 border border-border rounded-control text-sm focus-visible:outline-2 focus-visible:outline-focus"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              {searchResults.map(r => (
                <div
                  key={r.code}
                  className="flex items-center justify-between px-3 py-2.5 border border-border rounded-xl hover:border-brand-500 hover:bg-brand-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <code className="text-xs font-mono text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">{r.code}</code>
                    <span className="text-sm text-ink-800">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-400">Relevance {r.score}%</span>
                    <ProgressBar value={r.score} className="w-16" height="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Override reason */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-semibold text-ink-950">Override Reason</h4>
              <Ann>F1.5.4 Approval</Ann>
              <Ann>F1.5.5 Audit Capture</Ann>
            </div>
            <textarea
              value={overrideReason} onChange={e => setOverrideReason(e.target.value)}
              rows={3}
              placeholder="Reason for manual override — required for audit trail…"
              className="w-full border border-border rounded-control px-3 py-2 text-sm resize-none focus-visible:outline-2 focus-visible:outline-focus mb-3"
            />
            <p className="text-xs text-ink-400 mb-4">
              Override will be logged with your name, timestamp and reason for the audit trail (F1.5.5)
            </p>
            <div className="flex gap-3">
              <Button variant="primary" onClick={saveMapping} disabled={!overrideReason.trim()}>
                Save mapping
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const next = EXCEPTIONS.find(e => e.id !== selected);
                  if (next) setSelected(next.id);
                }}
              >
                Skip — review later
              </Button>
              <Button variant="ghost" onClick={goToExceptions}>
                View exception queue →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
