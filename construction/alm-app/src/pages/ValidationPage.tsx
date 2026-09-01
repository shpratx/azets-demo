import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button, Card, Chip, AlertBanner, DataTable, Tr, Td, PageHeader, TabBar, Ann } from '../components/ui';
import { VALIDATION_ISSUES } from '../data/mock';
import { useState } from 'react';

const PIPELINE_STEPS = [
  'File Parsing', 'Schema Validation', 'Normalisation', 'Duplicate Detection', 'Quality Scoring',
];

export default function ValidationPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Warnings (4)');
  const warnings = VALIDATION_ISSUES.filter(i => i.severity === 'Warning');
  const errors = VALIDATION_ISSUES.filter(i => i.severity === 'Error');

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <PageHeader
        title="Validation Results — Muldoon & Co"
        subtitle="Session A-2024-089 · muldoon-accounts.xlsx"
        actions={
          <div className="flex items-center gap-2">
            <span className="bg-ink-800 text-white text-xs font-bold px-3 py-1 rounded-pill">A-2024-089</span>
            <Ann>F1.2 Processing</Ann>
          </div>
        }
      />

      {/* Pipeline steps */}
      <Card>
        <h3 className="text-sm font-semibold text-ink-950 mb-5">Processing Pipeline</h3>
        <div className="flex items-center gap-0 flex-wrap">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle size={14} className="text-success flex-shrink-0" />
                <span className="text-sm font-medium text-success">{step}</span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && <span className="text-ink-300 px-2 text-lg">→</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: '3,847', color: 'border-t-ink-400' },
          { label: 'Passed',        value: '3,621 (94.1%)', color: 'border-t-success' },
          { label: 'Warnings',      value: '4',   color: 'border-t-warning' },
          { label: 'Errors',        value: '1',   color: 'border-t-danger' },
        ].map(s => (
          <div key={s.label} className={`bg-canvas border border-border rounded-card shadow-1 p-5 border-t-4 ${s.color}`}>
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-2">{s.label}</p>
            <p className="text-3xl font-semibold text-ink-950">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quality score + issues */}
      <div className="grid grid-cols-3 gap-6">
        {/* Score */}
        <Card className="flex flex-col items-center justify-center gap-3">
          <Ann>F1.2.5 Quality Score</Ann>
          <div className="w-28 h-28 rounded-full border-8 border-brand-500 flex items-center justify-center">
            <span className="text-3xl font-bold text-ink-950">94.1</span>
          </div>
          <p className="text-sm font-semibold text-ink-600">Quality Score</p>
          <p className="text-xs text-ink-400 text-center">Above 90% threshold — safe to proceed with mapping.</p>
        </Card>

        {/* Issues table */}
        <div className="col-span-2 flex flex-col gap-3">
          <TabBar
            tabs={['Warnings (4)', 'Errors (1)']}
            active={tab}
            onChange={setTab}
          />
          <DataTable headers={['Row', 'Code', 'Account Name', 'Issue', 'Severity']}>
            {(tab.startsWith('Warnings') ? warnings : errors).map(issue => (
              <Tr key={issue.row}>
                <Td className="tabular-nums text-ink-400">{issue.row}</Td>
                <Td><code className="bg-mist-100 px-1.5 py-0.5 rounded text-xs font-mono">{issue.accountCode}</code></Td>
                <Td>{issue.accountName}</Td>
                <Td className="text-xs">{issue.issue}</Td>
                <Td><Chip variant={issue.severity === 'Warning' ? 'warning' : 'danger'}>{issue.severity}</Chip></Td>
              </Tr>
            ))}
          </DataTable>
        </div>
      </div>

      {errors.length > 0 && (
        <AlertBanner type="danger" title="1 error must be resolved before mapping can proceed" body="Download the validation report, fix the listed errors in your source file, and re-upload." />
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost">↓ Download validation report</Button>
        <Button variant="ghost">Fix errors &amp; re-upload</Button>
        <div className="flex-1" />
        <Button variant="primary" onClick={() => navigate('/mapping')} disabled={errors.length > 0}>
          Proceed to mapping →
        </Button>
      </div>
    </div>
  );
}
