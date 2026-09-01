import { useNavigate } from 'react-router-dom';
import { Button, Card, Chip, DataTable, Tr, Td, PageHeader, Ann } from '../components/ui';
import { SYNC_RECORDS } from '../data/mock';

export default function CozoneSyncPage() {
  const navigate = useNavigate();

  const preSync = [
    { label: 'All accounts mapped (3,847/3,847)', done: true },
    { label: 'Manual review complete', done: true },
    { label: 'Audit trail generated', done: true },
    { label: 'Finance Manager approval obtained', done: true },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        title="Cozone Synchronisation"
        subtitle="Muldoon & Co — Session A-2024-089"
        actions={<Ann>F1.6 Cozone Integration</Ann>}
      />

      {/* Pre-sync checklist */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-base font-semibold text-ink-950">Pre-Sync Checklist</h3>
          <Ann>F1.6.2 Mapping Export</Ann>
        </div>
        <div className="flex flex-col gap-3 mb-6">
          {preSync.map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm', item.done ? 'bg-success text-white' : 'bg-mist-100 text-ink-400'].join(' ')}>
                {item.done ? '✓' : '○'}
              </div>
              <span className={['text-sm', item.done ? 'text-ink-800' : 'text-ink-400'].join(' ')}>{item.label}</span>
            </div>
          ))}
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/audit')}>
          🚀 Initiate Cozone Sync
        </Button>
      </Card>

      {/* Last successful sync */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-base font-semibold text-ink-950">Last Sync — Hartley Partners</h3>
          <Ann>F1.6.3 Sync Monitoring</Ann>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-50 border-4 border-success flex items-center justify-center text-xl">✓</div>
            <div>
              <p className="text-lg font-semibold text-success">Sync Complete</p>
              <p className="text-sm text-ink-400">18 Aug 2026 · 16:30</p>
            </div>
          </div>
          {[
            { l: 'Accounts Exported', v: '1,204' },
            { l: 'Failures', v: '0' },
            { l: 'Duration', v: '1m 23s' },
            { l: 'API Version', v: 'v3.2.1' },
          ].map(s => (
            <div key={s.l} className="bg-mist-50 rounded-xl p-3 min-w-[100px] text-center">
              <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-0.5">{s.l}</p>
              <p className="text-base font-semibold text-ink-950">{s.v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Connection health */}
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-ink-950">Cozone API Connection</h4>
            <Ann>F1.6.1 API Adapter</Ann>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 rounded-full bg-success animate-ping opacity-40" />
              <div className="relative w-3 h-3 rounded-full bg-success" />
            </div>
            <Chip variant="success">CONNECTED</Chip>
            <span className="text-xs text-ink-400">Last heartbeat 2s ago</span>
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-ink-600">
            <div className="flex justify-between"><span>API Version</span><span className="font-medium text-ink-950">v3.2.1</span></div>
            <div className="flex justify-between"><span>Environment</span><span className="font-medium text-ink-950">Production</span></div>
            <div className="flex justify-between"><span>Auth</span><span className="font-medium text-ink-950">OAuth 2.0</span></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-ink-950">Retry Framework</h4>
            <Ann>F1.6.4 Retry</Ann>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {[['Max retries', '3'], ['Backoff strategy', 'Exponential'], ['Initial delay', '2s'], ['Max delay', '30s']].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-ink-600">{k}</span>
                <span className="font-medium text-ink-950">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="text-xs text-success font-semibold">✓ No failures in the last 30 days</p>
          </div>
        </Card>
      </div>

      {/* Sync history table */}
      <div>
        <h3 className="text-base font-semibold text-ink-950 mb-3">Sync History</h3>
        <DataTable headers={['Firm', 'Synced At', 'Accounts', 'Failures', 'Duration', 'Status', 'Actions']}>
          {SYNC_RECORDS.map(r => (
            <Tr key={r.id}>
              <Td className="font-medium">{r.firmName}</Td>
              <Td className="tabular-nums text-ink-400">{new Date(r.syncedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Td>
              <Td>{r.accountsExported.toLocaleString()}</Td>
              <Td className={r.failures > 0 ? 'text-danger font-semibold' : ''}>{r.failures}</Td>
              <Td className="tabular-nums">{r.duration}</Td>
              <Td><Chip variant={r.status === 'Success' ? 'success' : r.status === 'Partial' ? 'warning' : 'danger'}>{r.status}</Chip></Td>
              <Td><Button variant="ghost" size="sm" onClick={() => navigate('/audit')}>View report</Button></Td>
            </Tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
