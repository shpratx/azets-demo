import { Button, Card, Chip, DataTable, Tr, Td, PageHeader, ProgressBar, Ann } from '../components/ui';
import { BULK_FIRMS } from '../data/mock';

const statusVariant = { Pending: 'neutral', Processing: 'info', Complete: 'success', Failed: 'danger' } as const;

export default function BulkOperationsPage() {
  const totalAccounts = BULK_FIRMS.reduce((s, f) => s + f.accountsTotal, 0);
  const done = BULK_FIRMS.filter(f => f.status === 'Complete').length;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        title="Bulk Mapping Operations"
        subtitle="Process multiple firms in a single batch session"
        actions={<Ann>F2.2 Bulk Operations</Ann>}
      />

      {/* Firm list */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink-950">Firms in Batch</h3>
            <Ann>F2.2.1 Multi-Firm Upload</Ann>
          </div>
          <Button variant="ghost" size="sm">+ Add another firm</Button>
        </div>
        <DataTable headers={['Firm Name', 'File', 'Format', 'Accounts', 'Status', 'Actions']}>
          {BULK_FIRMS.map(f => (
            <Tr key={f.id}>
              <Td className="font-medium">{f.firmName}</Td>
              <Td className="text-xs text-ink-400 font-mono">{f.fileName}</Td>
              <Td><span className="bg-mist-100 text-ink-600 text-xs font-bold px-2 py-0.5 rounded">{f.format}</span></Td>
              <Td>{f.accountsTotal.toLocaleString()}</Td>
              <Td><Chip variant={statusVariant[f.status]}>{f.status}</Chip></Td>
              <Td>
                {f.status !== 'Complete' && <Button variant="danger" size="sm">Remove</Button>}
                {f.status === 'Failed' && <Button variant="ghost" size="sm" className="ml-1">Retry</Button>}
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Card>

      {/* Batch settings */}
      <Card>
        <h3 className="text-base font-semibold text-ink-950 mb-4">Batch Settings</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Parallel Workers', value: '4', help: 'Firms processed simultaneously' },
            { label: 'Processing Timeout', value: '120s', help: 'Per-firm timeout before retry' },
            { label: 'Auto-Approve Threshold', value: '95%', help: 'Confidence above this is auto-accepted' },
          ].map(s => (
            <div key={s.label} className="bg-mist-50 rounded-xl p-4">
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-2xl font-semibold text-ink-950 mb-0.5">{s.value}</p>
              <p className="text-xs text-ink-400">{s.help}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Batch summary + CTA */}
      <Card className="bg-ink-950 border-ink-800">
        <div className="flex items-center justify-between gap-6">
          <div className="flex gap-8">
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Firms</p>
              <p className="text-2xl font-semibold text-white">{BULK_FIRMS.length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Total Accounts</p>
              <p className="text-2xl font-semibold text-white">{totalAccounts.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Est. Time</p>
              <p className="text-2xl font-semibold text-white">~12 min</p>
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={() => {}}>
            🚀 Start Batch Processing
          </Button>
        </div>
      </Card>

      {/* Monitoring dashboard */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-ink-950">Batch Progress</h3>
          <Ann>F2.2.3 Batch Monitoring</Ann>
          <Ann>F2.2.5 Parallel Execution</Ann>
        </div>
        {/* Overall */}
        <div className="mb-4 bg-canvas border border-border rounded-card shadow-1 p-5">
          <div className="flex justify-between text-sm text-ink-600 mb-2">
            <span className="font-semibold">Overall progress</span>
            <span>{done}/{BULK_FIRMS.length} firms complete</span>
          </div>
          <ProgressBar value={(done / BULK_FIRMS.length) * 100} height="h-3" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {BULK_FIRMS.map(f => (
            <Card key={f.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-ink-950">{f.firmName}</span>
                <Chip variant={statusVariant[f.status]}>{f.status}</Chip>
              </div>
              <ProgressBar value={f.progress} height="h-2" color={f.status === 'Failed' ? 'bg-danger' : 'bg-brand-500'} />
              <p className="text-xs text-ink-400 mt-2">
                {f.accountsDone.toLocaleString()} / {f.accountsTotal.toLocaleString()} accounts
                {f.status === 'Failed' && (
                  <> · <Button variant="ghost" size="sm" className="inline h-auto p-0 text-xs">Retry</Button></>
                )}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
