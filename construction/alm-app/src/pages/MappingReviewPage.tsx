import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button, Card, Chip, ConfidencePill, DataTable, Tr, Td, PageHeader, ProgressBar, Ann, AlertBanner } from '../components/ui';
import { MAPPING_SUGGESTIONS } from '../data/mock';
import type { MappingSuggestion } from '../types';

const matchChip: Record<MappingSuggestion['matchType'], [string, string]> = {
  'Rule-Based':  ['brand',   'Rule-Based'],
  'AI Semantic': ['info',    'AI Semantic'],
  'Similarity':  ['neutral', 'Similarity'],
};

export default function MappingReviewPage() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<MappingSuggestion[]>(MAPPING_SUGGESTIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = suggestions.filter(s => {
    const matchSearch = !search || s.legacyCode.toLowerCase().includes(search.toLowerCase()) || s.legacyName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter ||
      (statusFilter === 'High Confidence' && s.confidence >= 95) ||
      (statusFilter === 'Needs Review' && s.confidence < 75);
    return matchSearch && matchStatus;
  });

  const accept = (id: string) => setSuggestions(p => p.map(s => s.id === id ? { ...s, status: 'Accepted' } : s));
  const flag   = (id: string) => setSuggestions(p => p.map(s => s.id === id ? { ...s, status: 'Flagged'  } : s));

  const accepted = suggestions.filter(s => s.status === 'Accepted').length;
  const flagged  = suggestions.filter(s => s.status === 'Flagged').length;
  const highConf = suggestions.filter(s => s.confidence >= 95 && s.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI Mapping Suggestions — Muldoon & Co"
        subtitle="Session A-2024-089 · 3,847 accounts"
        actions={
          <>
            <Ann>F1.3.2 AI Suggestions</Ann>
            <Ann>F1.3.4 Confidence Score</Ann>
            <Ann>F1.4.1 Ambiguity Detection</Ann>
          </>
        }
      />

      {/* AI info banner */}
      <div className="bg-ink-950 rounded-xl px-5 py-4 flex items-start gap-3">
        <span className="text-xl mt-0.5">⚡</span>
        <div>
          <p className="text-sm font-semibold text-white mb-0.5">3-strategy AI mapping pipeline active</p>
          <p className="text-xs text-ink-400">Rule-Based (deterministic rules) → AI Semantic (transformer embeddings) → Similarity scoring (fuzzy name match). Results ranked by confidence.</p>
        </div>
      </div>

      {/* Summary chips */}
      <Card className="py-4 px-5">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-sm"><span className="font-bold text-ink-950">3,847</span> <span className="text-ink-400">total</span></div>
          <div className="w-px h-5 bg-border" />
          <div className="text-sm"><span className="font-bold text-success">2,843</span> <span className="text-ink-400">auto-approved (≥95%)</span></div>
          <div className="w-px h-5 bg-border" />
          <div className="text-sm"><span className="font-bold text-warning">778</span> <span className="text-ink-400">review (75–94%)</span></div>
          <div className="w-px h-5 bg-border" />
          <div className="text-sm"><span className="font-bold text-danger">226</span> <span className="text-ink-400">flagged (&lt;75%)</span></div>
          <div className="flex-1" />
          <ProgressBar value={94} height="h-2" className="w-32" />
          <span className="text-xs text-ink-400">94% complete</span>
        </div>
      </Card>

      {/* Bulk actions + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter by account code or name…"
            className="w-full h-10 pl-8 pr-3 border border-border rounded-control text-sm focus-visible:outline-2 focus-visible:outline-focus"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 border border-border rounded-control px-3 text-sm bg-canvas">
          {['All', 'High Confidence', 'Needs Review', 'Flagged', 'Accepted'].map(o => <option key={o}>{o}</option>)}
        </select>
        <div className="flex-1" />
        {highConf > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setSuggestions(p => p.map(s => s.confidence >= 95 ? { ...s, status: 'Accepted' } : s))}>
            ✓ Accept all high-confidence ({highConf})
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => navigate('/exceptions')}>
          View exception queue ({flagged}) →
        </Button>
      </div>

      {/* Table */}
      <DataTable headers={['Legacy Code', 'Legacy Name', 'Master Code', 'Master Name', 'Match Type', 'Confidence', 'Explanation', 'Status', 'Actions']}>
        {filtered.map(s => {
          const [mtVariant, mtLabel] = matchChip[s.matchType];
          return (
            <Tr key={s.id} highlight={s.status === 'Accepted'}>
              <Td><code className="bg-mist-100 px-1.5 py-0.5 rounded text-xs font-mono">{s.legacyCode}</code></Td>
              <Td className="font-medium">{s.legacyName}</Td>
              <Td><code className="bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded text-xs font-mono">{s.suggestedMasterCode}</code></Td>
              <Td>{s.suggestedMasterName}</Td>
              <Td><Chip variant={mtVariant as any} dot={false}>{mtLabel}</Chip></Td>
              <Td><ConfidencePill value={s.confidence} /></Td>
              <Td className="text-xs text-ink-600 max-w-[180px] truncate">{s.explanation}</Td>
              <Td>
                <Chip variant={s.status === 'Accepted' ? 'success' : s.status === 'Flagged' ? 'danger' : 'neutral'} dot={false}>
                  {s.status}
                </Chip>
              </Td>
              <Td>
                <div className="flex gap-1.5">
                  {s.status !== 'Accepted' && <Button variant="primary" size="sm" onClick={() => accept(s.id)}>Accept</Button>}
                  <Button variant="ghost" size="sm" onClick={() => navigate('/workbench')}>Override</Button>
                  {s.status !== 'Flagged' && <Button variant="ghost" size="sm" onClick={() => flag(s.id)}>Flag</Button>}
                </div>
              </Td>
            </Tr>
          );
        })}
      </DataTable>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-ink-400">
        <span>Showing {filtered.length} of 3,847 accounts</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled>← Previous</Button>
          <Button variant="ghost" size="sm">Next →</Button>
        </div>
      </div>

      {suggestions.some(s => s.status === 'Flagged') && (
        <AlertBanner
          title={`${flagged} accounts flagged as ambiguous — manual review required`}
          body="These accounts have confidence below 75%. They have been routed to the Exception Queue."
          action={<Button size="sm" onClick={() => navigate('/exceptions')}>Open Queue →</Button>}
        />
      )}

      {accepted > 0 && (
        <div className="flex justify-end">
          <Button variant="primary" size="lg" onClick={() => navigate('/sync')}>
            Proceed to Cozone sync ({accepted} approved) →
          </Button>
        </div>
      )}
    </div>
  );
}
