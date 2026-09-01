import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';
import { Button, Card, PageHeader, Ann } from '../components/ui';

export default function UploadPage() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [firmName, setFirmName] = useState('Muldoon & Co Ltd');
  const [acquisitionDate, setAcquisitionDate] = useState('2026-08-15');
  const [legacySystem, setLegacySystem] = useState('QuickBooks');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const formats = [
    { fmt: 'CSV', columns: ['Account Code', 'Account Name', 'Account Type', 'Parent Code', 'Currency'] },
    { fmt: 'XLSX', columns: ['Account Code', 'Account Name', 'Account Type', 'Parent Code', 'Currency'] },
    { fmt: 'XML', columns: ['<AccountCode>', '<AccountName>', '<AccountType>', '<ParentCode>', '<Currency>'] },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        title="Upload Legacy Accounts"
        subtitle="Import account structures from acquired firms for AI-assisted mapping"
        actions={<Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>← Back to Dashboard</Button>}
      />

      {/* Drop zone */}
      <Card className="relative">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-ink-950">Account File</h3>
          <Ann>F1.1.1 / F1.1.2 / F1.1.3 Upload</Ann>
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={[
            'border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer text-center',
            dragging ? 'border-brand-500 bg-brand-100' : 'border-border hover:border-ink-400',
          ].join(' ')}
        >
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center">
            <UploadCloud size={28} className="text-brand-600" />
          </div>
          {file ? (
            <>
              <p className="font-semibold text-ink-950">File selected: <span className="text-brand-600">{file.name}</span></p>
              <p className="text-sm text-ink-400">{(file.size / 1024).toFixed(1)} KB</p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-ink-800">Drag & drop your account file here</p>
              <p className="text-sm text-ink-400">Supports CSV, XLSX, XML · Up to 50 MB</p>
            </>
          )}
          <label className="cursor-pointer">
            <input type="file" className="sr-only" accept=".csv,.xlsx,.xml"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <span className="inline-flex h-10 items-center px-5 rounded-pill bg-brand-500 text-ink-950 text-sm font-semibold hover:bg-brand-600 transition-colors">
              Browse files
            </span>
          </label>
        </div>
      </Card>

      {/* Format requirements */}
      <Card>
        <h3 className="text-base font-semibold text-ink-950 mb-4">Required File Format</h3>
        <div className="grid grid-cols-3 gap-4">
          {formats.map(f => (
            <div key={f.fmt} className="bg-mist-50 border border-border rounded-xl p-4">
              <p className="text-sm font-bold text-ink-950 mb-3 flex items-center gap-2">
                <span className="bg-ink-950 text-white text-[10px] font-bold px-2 py-0.5 rounded">{f.fmt}</span>
                Required columns
              </p>
              <ul className="flex flex-col gap-1">
                {f.columns.map(c => (
                  <li key={c} className="text-xs text-ink-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-brand-500 flex-shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Firm details */}
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <h3 className="text-base font-semibold text-ink-950">Firm Details</h3>
          <Ann>F1.1 Intake Metadata</Ann>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-800">Firm Name *</label>
            <input value={firmName} onChange={e => setFirmName(e.target.value)}
              className="h-11 border border-border rounded-control px-3 text-sm focus-visible:outline-2 focus-visible:outline-focus" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-800">Acquisition Date *</label>
            <input type="date" value={acquisitionDate} onChange={e => setAcquisitionDate(e.target.value)}
              className="h-11 border border-border rounded-control px-3 text-sm focus-visible:outline-2 focus-visible:outline-focus" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-ink-800">Legacy Accounting System</label>
            <select value={legacySystem} onChange={e => setLegacySystem(e.target.value)}
              className="h-11 border border-border rounded-control px-3 text-sm bg-canvas focus-visible:outline-2 focus-visible:outline-focus">
              {['QuickBooks', 'Sage', 'Xero', 'FreeAgent', 'Other'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 col-span-2">
            <label className="text-sm font-semibold text-ink-800">Notes</label>
            <textarea rows={3} placeholder="Any additional context about this firm's account structure..."
              className="border border-border rounded-control px-3 py-2 text-sm resize-none focus-visible:outline-2 focus-visible:outline-focus" />
          </div>
        </div>
      </Card>

      {/* Validation rules callout */}
      <div className="bg-brand-100 border border-brand-500 rounded-xl p-5 flex gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-bold text-ink-950">Validation rules applied on upload</p>
            <Ann>F1.1.4 Schema Validation</Ann>
            <Ann>F1.1.5 Error Reporting</Ann>
          </div>
          <ul className="flex flex-col gap-1">
            {[
              'Account Code must be unique within the uploaded file',
              'Account Name is required (max 255 characters)',
              'Account Type must match a valid classification (Asset, Liability, Equity, Revenue, Expense)',
              'Parent Code, if provided, must reference an existing code in the same file',
              'Currency defaults to GBP if not specified',
            ].map(r => (
              <li key={r} className="text-sm text-ink-700 flex items-start gap-1.5">
                <span className="text-brand-600 mt-0.5">✓</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/validation')} disabled={!firmName}>
        Upload and Validate →
      </Button>
    </div>
  );
}
