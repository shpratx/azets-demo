import { useState } from 'react';
import { Button, Card, Chip, DataTable, Tr, Td, PageHeader, TabBar, Ann } from '../components/ui';
import { RULES } from '../data/mock';

const statusVariant = { Active: 'success', Draft: 'neutral', Deprecated: 'danger' } as const;

export default function RulesEnginePage() {
  const [tab, setTab] = useState('Rules Library');
  const [typeFilter, setTypeFilter] = useState('All');
  const [simInput, setSimInput] = useState('MUL-2847');
  const [simName, setSimName] = useState('Suspense Account Legacy');
  const [simRan, setSimRan] = useState(false);

  const filtered = typeFilter === 'All' ? RULES : RULES.filter(r => r.status === typeFilter);

  const simResults = [
    { rule: 'RULE-042', name: 'Suspense accounts', matched: true, boost: 5, note: 'name.includes("suspense") → true' },
    { rule: 'RULE-001', name: 'Cash accounts mapping', matched: false, boost: 0, note: 'code.startsWith("CASH") → false' },
    { rule: 'RULE-004', name: 'Revenue top-level', matched: false, boost: 0, note: "type === 'Revenue' → false" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Mapping Rules Engine"
        subtitle="Deterministic rule library — 142 active rules · v1.8"
        actions={
          <>
            <Ann>F0.4 Rules Engine</Ann>
            <Button variant="primary" size="sm">+ Add new rule</Button>
          </>
        }
      />

      <div className="flex gap-5">
        <div className="flex-1">
          <TabBar tabs={['Rules Library', 'Simulation', 'Version History']} active={tab} onChange={tab => setTab(tab)} />

          {tab === 'Rules Library' && (
            <>
              <div className="flex gap-3 mb-4 flex-wrap">
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
                  {['All', 'Active', 'Draft', 'Deprecated'].map(o => <option key={o}>{o}</option>)}
                </select>
                <Ann>F0.4.1 Rule Mgmt</Ann>
                <Ann>F0.4.3 Evaluation</Ann>
              </div>
              <DataTable headers={['Priority', 'Rule ID', 'Name', 'Condition', 'Maps To', 'Conf. Boost', 'Status', 'Used', 'Actions']}>
                {filtered.map(r => (
                  <Tr key={r.id}>
                    <Td className="tabular-nums font-bold text-ink-400">{r.priority}</Td>
                    <Td><code className="bg-mist-100 px-1.5 py-0.5 rounded text-xs font-mono">{r.id}</code></Td>
                    <Td className="font-medium">{r.name}</Td>
                    <Td><code className="bg-ink-950 text-brand-500 px-2 py-0.5 rounded text-[10px] font-mono max-w-[160px] block truncate">{r.condition}</code></Td>
                    <Td><code className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-mono">{r.action}</code></Td>
                    <Td className="tabular-nums text-sm">+{r.confidenceBoost}%</Td>
                    <Td><Chip variant={statusVariant[r.status]}>{r.status}</Chip></Td>
                    <Td className="tabular-nums text-ink-400">{r.usedCount.toLocaleString()}</Td>
                    <Td>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => setTab('Simulation')}>Test</Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            </>
          )}

          {tab === 'Simulation' && (
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <h4 className="text-sm font-semibold text-ink-950">Test Rules Against Sample Data</h4>
                <Ann>F0.4.5 Simulation</Ann>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-ink-800">Account Code</label>
                  <input value={simInput} onChange={e => setSimInput(e.target.value)}
                    className="h-10 border border-border rounded-control px-3 text-sm focus-visible:outline-2 focus-visible:outline-focus" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-ink-800">Account Name</label>
                  <input value={simName} onChange={e => setSimName(e.target.value)}
                    className="h-10 border border-border rounded-control px-3 text-sm focus-visible:outline-2 focus-visible:outline-focus" />
                </div>
              </div>
              <Button variant="primary" onClick={() => setSimRan(true)}>▶ Run simulation</Button>
              {simRan && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-ink-950 mb-3">Rule evaluation results:</p>
                  <div className="flex flex-col gap-2">
                    {simResults.map(r => (
                      <div key={r.rule} className={['flex items-center gap-3 p-3 rounded-xl border', r.matched ? 'border-brand-500 bg-brand-100' : 'border-border bg-mist-50'].join(' ')}>
                        <span className={r.matched ? 'text-success text-base' : 'text-ink-300 text-base'}>
                          {r.matched ? '✓' : '✕'}
                        </span>
                        <code className="text-xs font-mono">{r.rule}</code>
                        <span className="text-sm flex-1">{r.name}</span>
                        {r.matched && <span className="text-xs font-semibold text-brand-600">+{r.boost}% confidence</span>}
                        <code className="text-[10px] text-ink-400 font-mono">{r.note}</code>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-brand-100 rounded-xl p-4">
                    <p className="text-sm font-bold text-ink-950">Result: 1 rule matched — AZT-5510 (Suspense — Clearing) · +5% confidence boost</p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {tab === 'Version History' && (
            <Card>
              <p className="text-sm text-ink-600 mb-3">Current: v1.8 · Staged changes: 2 · Last published: 14 Aug 2026</p>
              <div className="flex flex-col gap-2">
                {[['v1.8 (current)', '14 Aug 2026', '5 rules added'], ['v1.7', '01 Jun 2026', '3 rules deprecated'], ['v1.6', '12 Mar 2026', '8 new rules']].map(([v, d, c]) => (
                  <div key={v} className="flex items-center justify-between p-3 bg-mist-50 rounded-xl border border-border">
                    <div><p className="text-sm font-semibold text-ink-950">{v}</p><p className="text-xs text-ink-400">{d} · {c}</p></div>
                    <Button variant="ghost" size="sm">View diff</Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
