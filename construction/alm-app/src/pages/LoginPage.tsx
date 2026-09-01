import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('priya.sharma@azets.com');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-mist-50">
      {/* Header */}
      <header className="h-16 bg-ink-950 border-b-[3px] border-brand-500 flex items-center px-10 gap-4">
        <span className="text-lg font-extrabold text-white tracking-tight">Azets <span className="text-brand-500">ALM</span></span>
        <span className="text-[11px] font-medium text-ink-400 uppercase tracking-widest">Automated Ledger Mapping</span>
      </header>

      <div className="flex flex-1">
        {/* Left brand panel */}
        <div className="hidden lg:flex flex-col justify-center flex-1 bg-ink-950 px-20 py-16 gap-10">
          <div>
            <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-4">Azets Cozone Platform</p>
            <h1 className="text-5xl font-semibold text-white leading-[1.08] tracking-tight max-w-[14ch] mb-5">
              Ledger mapping, made accurate.
            </h1>
            <p className="text-base text-ink-400 leading-relaxed max-w-[46ch]">
              AI-assisted account mapping that reduces errors from 15% to under 2% — and cuts integration time from weeks to days.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {[
              { icon: '⚡', title: 'AI-driven suggestions', body: 'Confidence-scored mapping recommendations with full explainability' },
              { icon: '🔒', title: 'Enterprise security', body: 'TLS 1.3 · AES-256 · GDPR compliant · OIDC SSO' },
              { icon: '📋', title: 'Audit-ready reporting', body: 'Every decision, override and timestamp captured automatically' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center text-base flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{f.title}</p>
                  <p className="text-sm text-ink-400">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right form */}
        <div className="flex flex-1 items-center justify-center px-8 py-12 bg-mist-50">
          <div className="w-full max-w-md bg-canvas border border-border rounded-card shadow-2 p-12">
            <h2 className="text-2xl font-semibold text-ink-950 mb-1">Sign in</h2>
            <p className="text-sm text-ink-600 mb-8">Use your Azets enterprise account or SSO provider.</p>

            {/* SSO */}
            <Button variant="ghost" fullWidth className="mb-1 justify-start gap-3" onClick={() => navigate('/dashboard')}>
              <span className="w-6 h-6 bg-mist-100 rounded text-[11px] font-bold text-ink-600 flex items-center justify-center">M</span>
              Continue with Microsoft / Azets SSO
            </Button>

            <div className="flex items-center gap-3 my-5">
              <hr className="flex-1 border-border" />
              <span className="text-xs text-ink-400">or sign in with email</span>
              <hr className="flex-1 border-border" />
            </div>

            {/* Email / password */}
            <div className="flex flex-col gap-4 mb-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink-800" htmlFor="email">Work email address</label>
                <input
                  id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@azets.com"
                  className="h-13 border border-border rounded-control px-4 text-sm text-ink-950 bg-canvas focus-visible:outline-2 focus-visible:outline-focus"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-ink-800" htmlFor="password">Password</label>
                <input
                  id="password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-13 border border-border rounded-control px-4 text-sm text-ink-950 bg-canvas focus-visible:outline-2 focus-visible:outline-focus"
                />
                <p className="text-xs text-ink-400">Must meet Azets password policy (12+ chars, mixed case, number)</p>
              </div>
            </div>

            <div className="flex justify-end mb-5">
              <a href="#" className="text-xs text-ink-600 underline">Forgot password?</a>
            </div>

            <Button variant="primary" fullWidth size="lg" onClick={() => navigate('/dashboard')}>
              Sign in →
            </Button>

            <div className="mt-6 bg-brand-100 border border-brand-500 rounded-xl p-4 flex gap-3">
              <span className="text-base mt-0.5">🔐</span>
              <div>
                <p className="text-sm font-bold text-ink-950 mb-0.5">Multi-factor authentication required</p>
                <p className="text-xs text-ink-600">You will be prompted for your authenticator code after sign-in. (F0.2.1 MFA enforcement)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-ink-950 text-ink-400 text-xs px-10 py-4 flex justify-between items-center">
        <span>© 2025 Azets Group</span>
        <span>Privacy Policy · Cookie Policy · Accessibility · GDPR</span>
        <span>v2.1.0 · TLS 1.3 · AES-256</span>
      </footer>
    </div>
  );
}
