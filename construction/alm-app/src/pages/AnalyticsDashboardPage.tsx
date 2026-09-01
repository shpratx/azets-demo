import { Button, Card, DataTable, Tr, Td, PageHeader, ProgressBar, Ann } from '../components/ui';
import { KPI_DATA, SLA_METRICS } from '../data/mock';

export default function AnalyticsDashboardPage() {
  const kpis = [
    { l: 'Total Sessions',       v: KPI_DATA.totalSessions },
    { l: 'Accounts Processed',   v: KPI_DATA.accountsProcessed.toLocaleString() },
    { l: 'Avg Auto-Map Rate',     v: `${KPI_DATA.avgAutoMapRate}%` },
    { l: 'Avg Error Rate',        v: `${KPI_DATA.avgErrorRate}%` },
    { l: 'Avg Processing Time',   v: KPI_DATA.avgProcessingTime },
    { l: 'Cozone Syncs',          v: KPI_DATA.cozoneSync },
  ];

  const weeklyVols = [120, 340, 280, 510, 390, 620, 480, 590, 720, 840, 760, 910, 880, 980];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Operational Analytics"
        subtitle="Last 30 days · 01 Aug – 01 Sep 2026"
        actions={
          <>
            <Ann>F2.4 Analytics</Ann>
            <select className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
              {['Last 30 days', 'Last 90 days', 'Last 12 months', 'Custom'].map(o => <option key={o}>{o}</option>)}
            </select>
            <Button variant="ghost" size="sm">↓ Export report</Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(k => (
          <div key={k.l} className="bg-canvas border border-border rounded-card shadow-1 p-4 text-center">
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-1">{k.l}</p>
            <p className="text-2xl font-semibold text-ink-950">{k.v}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Volume chart placeholder */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-ink-950">Accounts Processed per Week</h4>
            <Ann>F2.4.1 Processing Metrics</Ann>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {weeklyVols.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="w-full bg-brand-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${(v / 1000) * 100}%` }} title={`Week ${i + 1}: ${v} accounts`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-ink-400 mt-1">
            <span>Week 1</span><span>Week 7</span><span>Week 14</span>
          </div>
        </Card>

        {/* Error trend */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-ink-950">Error Rate Trend</h4>
            <Ann>F2.4.2 Error Analytics</Ann>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Duplicate',      pct: 38, color: 'bg-warning' },
              { label: 'Ambiguous',      pct: 29, color: 'bg-brand-500' },
              { label: 'Missing Code',   pct: 25, color: 'bg-danger' },
              { label: 'Format Error',   pct: 8,  color: 'bg-ink-400' },
            ].map(e => (
              <div key={e.label}>
                <div className="flex justify-between text-xs text-ink-600 mb-1">
                  <span>{e.label}</span><span>{e.pct}%</span>
                </div>
                <ProgressBar value={e.pct} height="h-2.5" color={e.color} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 bg-brand-100 rounded-xl p-3">
            <span className="text-success text-base">✓</span>
            <p className="text-xs text-ink-800">Current error rate <strong>1.8%</strong> — below 2% target</p>
          </div>
        </Card>
      </div>

      {/* SLA table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-semibold text-ink-950">SLA Compliance</h3>
          <Ann>F2.4.4 SLA Monitoring</Ann>
        </div>
        <DataTable headers={['Metric', 'Target', 'Actual', 'Status']}>
          {SLA_METRICS.map(m => (
            <Tr key={m.name}>
              <Td className="font-medium">{m.name}</Td>
              <Td className="text-ink-600">{m.target}</Td>
              <Td className={m.met ? 'text-success font-semibold' : 'text-danger font-semibold'}>{m.actual}</Td>
              <Td>
                <span className={['inline-flex items-center gap-1.5 text-sm font-semibold', m.met ? 'text-success' : 'text-danger'].join(' ')}>
                  {m.met ? '✓ Met' : '✕ Breached'}
                </span>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </div>

      {/* Adoption */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-sm font-semibold text-ink-950">Adoption Analytics</h4>
          <Ann>F2.4.3 Adoption</Ann>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">Finance teams using ALM</p>
            <p className="text-4xl font-semibold text-success">80%</p>
            <p className="text-xs text-ink-400 mt-1">8/10 M&A projects · Target achieved ✓</p>
          </div>
          <div className="flex-1">
            <ProgressBar value={80} height="h-4" />
            <div className="flex justify-between text-xs text-ink-400 mt-1"><span>0%</span><span>Target: 80%</span><span>100%</span></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
