import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button, Card, PageHeader, Ann } from '../components/ui';

const faqs = [
  { q: 'File upload fails validation', a: 'Ensure your file is in CSV, XLSX, or XML format and does not exceed 50 MB. Check that required columns (Account Code, Account Name, Account Type) are present with the correct headers.' },
  { q: 'AI mapping shows very low confidence', a: 'Low confidence (<75%) typically means the account name or code does not closely match any master ledger account. Use the Manual Workbench to search and assign the correct code.' },
  { q: 'Cozone sync timeout', a: 'Sync timeouts are usually transient. The system will automatically retry up to 3 times with exponential backoff. If the issue persists, check the Cozone API connection health on the Sync page.' },
  { q: 'How to export an audit report', a: 'Navigate to Audit Reports, select your session, and click "Generate PDF" or "Export CSV". Reports include all mapping decisions, overrides and timestamps.' },
  { q: 'What does "Duplicate" exception mean?', a: 'A Duplicate exception means the same account code appears more than once in the uploaded file. Remove the duplicate from the source file and re-upload.' },
  { q: 'How are AI suggestions generated?', a: 'The AI pipeline uses three strategies: (1) deterministic rule matching, (2) transformer-based semantic similarity, and (3) fuzzy name matching. Results are confidence-scored and ranked.' },
];

const articles = [
  { title: 'Getting Started — Your First Upload', cat: 'Guide', mins: '3 min read' },
  { title: 'Understanding Confidence Scores', cat: 'Explainer', mins: '5 min read' },
  { title: 'Manual Override Best Practices', cat: 'Guide', mins: '4 min read' },
  { title: 'GDPR and Data Handling', cat: 'Compliance', mins: '6 min read' },
  { title: 'Bulk Processing Tutorial', cat: 'Tutorial', mins: '8 min read' },
  { title: 'Cozone Integration Setup', cat: 'Technical', mins: '7 min read' },
];

export default function HelpSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'assistant', text: 'Hi Priya! I can help with any question about account mapping, uploads, or the ALM tool. What do you need?' },
  ]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [
      ...prev,
      { from: 'user', text: chatInput },
      { from: 'assistant', text: `I understand you're asking about "${chatInput}". Account MUL-2847 was flagged as ambiguous because 3 possible master ledger accounts matched with confidence below 75%: AZT-5510 (68%), AZT-5520 (62%), AZT-3010 (55%). Navigate to the Manual Workbench to resolve it.` },
    ]);
    setChatInput('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <PageHeader
        title="Help & Support Centre"
        subtitle="Guides, troubleshooting and support for Azets ALM"
        actions={<Ann>F2.3 Help & Support</Ann>}
      />

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input placeholder="Search help articles, guides and troubleshooting…"
          className="w-full h-14 pl-12 pr-4 border border-border rounded-2xl text-base shadow-1 focus-visible:outline-2 focus-visible:outline-focus" />
      </div>

      {/* Quick help cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🚀', title: 'Getting Started', body: 'Upload your first account file and understand the mapping flow' },
          { icon: '🤖', title: 'Understanding AI Mapping', body: 'How confidence scores work and what they mean for your data' },
          { icon: '✏️', title: 'Manual Override Guide', body: 'When and how to override AI suggestions in the workbench' },
        ].map(c => (
          <Card key={c.title} interactive className="cursor-pointer">
            <div className="text-3xl mb-3">{c.icon}</div>
            <h4 className="text-sm font-semibold text-ink-950 mb-1">{c.title}</h4>
            <p className="text-xs text-ink-600 leading-relaxed">{c.body}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* AI Assistant */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-ink-950">Mapping Assistant</h4>
            <Ann>F2.3.2 Help Assistant</Ann>
          </div>
          <div className="bg-mist-50 rounded-xl p-4 h-48 overflow-y-auto flex flex-col gap-3 mb-3">
            {messages.map((m, i) => (
              <div key={i} className={['flex', m.from === 'user' ? 'justify-end' : 'justify-start'].join(' ')}>
                <div className={['max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed', m.from === 'user' ? 'bg-brand-500 text-ink-950' : 'bg-canvas border border-border text-ink-800'].join(' ')}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about account mapping…"
              className="flex-1 h-9 border border-border rounded-control px-3 text-sm focus-visible:outline-2 focus-visible:outline-focus" />
            <Button variant="primary" size="sm" onClick={sendMessage}>Send</Button>
          </div>
        </Card>

        {/* Support ticket */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-ink-950">Raise a Support Ticket</h4>
            <Ann>F2.3.4 Support Requests</Ann>
          </div>
          <div className="flex flex-col gap-3">
            <select className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
              {['Select category…', 'Upload Issue', 'Mapping Problem', 'Cozone Sync', 'Access & Permissions', 'Other'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
              {['Priority: Medium', 'Priority: Low', 'Priority: High', 'Priority: Critical'].map(o => <option key={o}>{o}</option>)}
            </select>
            <textarea rows={3} placeholder="Describe the issue…"
              className="border border-border rounded-control px-3 py-2 text-sm resize-none focus-visible:outline-2 focus-visible:outline-focus" />
            <Button variant="primary" fullWidth size="sm">Submit ticket →</Button>
          </div>
          <div className="mt-3 pt-3 border-t border-border text-xs text-ink-400">
            <p>📧 support@azets.com</p>
            <p>📞 0800-123-4567 (Mon–Fri 8am–6pm)</p>
          </div>
        </Card>
      </div>

      {/* Troubleshooting FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-ink-950">Troubleshooting</h3>
          <Ann>F2.3.3 Troubleshooting Catalog</Ann>
        </div>
        <div className="flex flex-col gap-0 border border-border rounded-card overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border last:border-b-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-mist-50 transition-colors"
              >
                <span className="text-sm font-semibold text-ink-950">{faq.q}</span>
                <span className="text-ink-400 text-lg ml-4 flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-ink-600 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge base articles */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-ink-950">Knowledge Base</h3>
          <Ann>F2.3.5 Knowledge Base</Ann>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {articles.map(a => (
            <Card key={a.title} interactive className="cursor-pointer p-4">
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wide mb-1">{a.cat}</p>
              <h5 className="text-sm font-semibold text-ink-950 leading-tight mb-1">{a.title}</h5>
              <p className="text-xs text-ink-400">{a.mins}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
