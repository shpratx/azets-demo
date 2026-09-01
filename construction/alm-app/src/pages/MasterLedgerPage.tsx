import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button, Card, Chip, DataTable, Tr, Td, PageHeader, TabBar, Ann } from '../components/ui';
import { MASTER_LEDGER } from '../data/mock';

const typeVariant: Record<string, string> = {
  Asset: 'brand', Liability: 'warning', Equity: 'info',
  Revenue: 'success', Expense: 'danger', Memo: 'neutral',
};

const versions = [
  { v: 'v2024.3', date: '14 Aug 2026', changes: 12, current: true },
  { v: 'v2024.2', date: '01 Jun 2026', changes: 7 },
  { v: 'v2024.1', date: '15 Feb 2026', changes: 23 },
  { v: 'v2023.4', date: '01 Dec 2025', changes: 4 },
];

export default function MasterLedgerPage() {
  const [tab, setTab] = useState('Browse Ledger');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = MASTER_LEDGER.filter(a =>
    (!search || a.code.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'All' || a.type === typeFilter)
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Azets Master Ledger"
        subtitle="Authoritative chart of accounts — v2024.3 · 1,247 accounts"
        actions={
          <>
            <Chip variant="success">Active</Chip>
            <span className="bg-ink-800 text-white text-xs font-bold px-3 py-1 rounded-pill">v2024.3</span>
            <Ann>F0.3 Master Ledger</Ann>
            <Button variant="primary" size="sm">+ Add Account</Button>
          </>
        }
      />

      <div className="flex gap-5">
        <div className="flex-1">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { l: 'Total Accounts', v: '1,247' },
              { l: 'Account Types', v: '6' },
              { l: 'Last Updated', v: '14 Aug 2026' },
            ].map(s => (
              <div key={s.l} className="bg-canvas border border-border rounded-card shadow-1 p-5">
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">{s.l}</p>
                <p className="text-2xl font-semibold text-ink-950">{s.v}</p>
              </div>
            ))}
          </div>

          <TabBar tabs={['Browse Ledger', 'Import', 'Audit Log']} active={tab} onChange={setTab} />

          {tab === 'Browse Ledger' && (
            <>
              {/* Filters */}
              <div className="flex gap-3 mb-4 flex-wrap">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or name…"
                    className="w-full h-9 pl-8 pr-3 border border-border rounded-control text-sm focus-visible:outline-2 focus-visible:outline-focus" />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                  className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
                  {['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Memo'].map(t => <option key={t}>{t}</option>)}
                </select>
                <Ann>F0.3.2 Maintenance UI</Ann>
                <Ann>F0.3.4 Classification</Ann>
              </div>
              <DataTable headers={['Code', 'Name', 'Type', 'Classification', 'Status', 'Last Modified', 'Actions']}>
                {filtered.map(a => (
                  <Tr key={a.code}>
                    <Td><code className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-mono">{a.code}</code></Td>
                    <Td className="font-medium">{a.name}</Td>
                    <Td><Chip variant={typeVariant[a.type] as any} dot={false}>{a.type}</Chip></Td>
                    <Td className="text-xs text-ink-600">{a.classification}</Td>
                    <Td><Chip variant={a.status === 'Active' ? 'success' : 'neutral'} dot={false}>{a.status}</Chip></Td>
                    <Td className="tabular-nums text-ink-400 text-xs">{a.lastModified}</Td>
                    <Td>
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Deactivate</Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            </>
          )}
          {tab === 'Import' && (
            <Card>
              <h4 className="text-sm font-semibold text-ink-950 mb-3">Import New Ledger Version</h4>
              <p className="text-sm text-ink-600 mb-4">Upload a CSV file containing the updated chart of accounts. A new version will be created — existing mappings will reference the previous version.</p>
              <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
                <p className="text-sm text-ink-400">Drop CSV file here or <span className="text-brand-600 underline cursor-pointer">browse</span></p>
              </div>
            </Card>
          )}
        </div>

        {/* Version history panel */}
        <div className="w-64 flex-shrink-0">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-sm font-semibold text-ink-950">Version History</h4>
              <Ann>F0.3.3</Ann>
            </div>
            <div className="flex flex-col gap-3">
              {versions.map(v => (
                <div key={v.v} className={['p-3 rounded-xl border', v.current ? 'border-brand-500 bg-brand-100' : 'border-border bg-mist-50'].join(' ')}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-ink-950">{v.v}</span>
                    {v.current && <Chip variant="brand" dot={false} className="text-[10px]">Current</Chip>}
                  </div>
                  <p className="text-xs text-ink-400">{v.date} · {v.changes} changes</p>
                  {!v.current && <button className="text-xs text-brand-600 underline mt-1">View diff</button>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
