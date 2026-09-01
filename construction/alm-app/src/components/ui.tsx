import React from 'react';

// ─── Button ───────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type BtnSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantCls: Record<BtnVariant, string> = {
  primary: 'bg-brand-500 text-ink-950 hover:bg-brand-600 border-transparent',
  secondary: 'bg-ink-950 text-white hover:bg-ink-800 border-transparent',
  ghost: 'bg-transparent text-ink-800 border-border hover:border-ink-400',
  danger: 'bg-danger text-white hover:opacity-90 border-transparent',
};
const sizeCls: Record<BtnSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function Button({ variant = 'primary', size = 'md', fullWidth, loading, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-pill border font-semibold transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        variantCls[variant], sizeCls[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : null}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  accent?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
}

const accentCls = {
  brand: 'border-t-4 border-t-brand-500',
  success: 'border-t-4 border-t-success',
  warning: 'border-t-4 border-t-warning',
  danger: 'border-t-4 border-t-danger',
  neutral: 'border-t-4 border-t-ink-400',
};

export function Card({ interactive, accent, children, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        'bg-canvas border border-border rounded-card shadow-1 p-6',
        interactive ? 'transition-shadow hover:shadow-2 cursor-pointer' : '',
        accent ? accentCls[accent] : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// ─── Chip / Badge ─────────────────────────────────────────────────────────
type ChipVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'brand' | 'info';

const chipCls: Record<ChipVariant, string> = {
  success: 'bg-green-100 text-success',
  warning: 'bg-yellow-100 text-warning',
  danger: 'bg-red-100 text-danger',
  neutral: 'bg-mist-100 text-ink-600',
  brand: 'bg-brand-100 text-brand-700',
  info: 'bg-blue-100 text-blue-800',
};
const chipDotCls: Record<ChipVariant, string> = {
  success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger',
  neutral: 'bg-ink-400', brand: 'bg-brand-500', info: 'bg-blue-600',
};

interface ChipProps { variant?: ChipVariant; dot?: boolean; children: React.ReactNode; className?: string }

export function Chip({ variant = 'neutral', dot = true, children, className = '' }: ChipProps) {
  return (
    <span className={['inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold', chipCls[variant], className].join(' ')}>
      {dot && <span className={['w-1.5 h-1.5 rounded-full flex-shrink-0', chipDotCls[variant]].join(' ')} />}
      {children}
    </span>
  );
}

// ─── AnnotationBadge ──────────────────────────────────────────────────────
export function Ann({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={['inline-flex items-center bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap', className].join(' ')}>
      {children}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────
interface ProgressBarProps { value: number; max?: number; color?: string; height?: string; className?: string }

export function ProgressBar({ value, max = 100, color = 'bg-brand-500', height = 'h-2', className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={['w-full bg-mist-100 rounded-full overflow-hidden', height, className].join(' ')}>
      <div className={['h-full rounded-full transition-all', color].join(' ')} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-ink-950">{title}</h2>
        {subtitle && <p className="text-sm text-ink-600 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4 opacity-30">{icon}</div>
      <p className="text-base font-semibold text-ink-600">{title}</p>
      {body && <p className="text-sm text-ink-400 mt-1 max-w-xs">{body}</p>}
    </div>
  );
}

// ─── AlertBanner ─────────────────────────────────────────────────────────
interface AlertBannerProps {
  type?: 'warning' | 'success' | 'danger' | 'info';
  title: string;
  body?: string;
  action?: React.ReactNode;
}

const alertCls = {
  warning: 'bg-yellow-50 border-yellow-300 text-yellow-900',
  success: 'bg-green-50 border-green-300 text-green-900',
  danger: 'bg-red-50 border-red-300 text-red-900',
  info: 'bg-blue-50 border-blue-300 text-blue-900',
};

export function AlertBanner({ type = 'warning', title, body, action }: AlertBannerProps) {
  const icons = { warning: '⚠️', success: '✅', danger: '🚫', info: 'ℹ️' };
  return (
    <div className={['flex items-start gap-3 border rounded-xl p-4', alertCls[type]].join(' ')}>
      <span className="text-lg mt-0.5 flex-shrink-0">{icons[type]}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        {body && <p className="text-sm opacity-80 mt-0.5">{body}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── StatsCard ───────────────────────────────────────────────────────────
interface StatsCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  accent?: CardProps['accent'];
}

export function StatsCard({ label, value, delta, deltaUp, accent }: StatsCardProps) {
  return (
    <Card accent={accent}>
      <p className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-4xl font-semibold text-ink-950 leading-none">{value}</p>
      {delta && (
        <p className={['text-sm mt-1.5 flex items-center gap-1', deltaUp === true ? 'text-success' : deltaUp === false ? 'text-danger' : 'text-ink-400'].join(' ')}>
          {delta}
        </p>
      )}
    </Card>
  );
}

// ─── PageHeader ──────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: string;
}

export function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {breadcrumb && <p className="text-xs text-ink-400 uppercase tracking-wider mb-1">{breadcrumb}</p>}
        <h1 className="text-2xl font-semibold text-ink-950 leading-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-600 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0 ml-4">{actions}</div>}
    </div>
  );
}

// ─── Table helpers ────────────────────────────────────────────────────────
export function DataTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-border rounded-card shadow-1">
      <table className="w-full text-sm">
        <thead className="bg-mist-50 border-b border-border">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-ink-400 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-canvas divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick, highlight }: { children: React.ReactNode; onClick?: () => void; highlight?: boolean }) {
  return (
    <tr
      onClick={onClick}
      className={['transition-colors', onClick ? 'cursor-pointer' : '', highlight ? 'bg-brand-100' : 'hover:bg-mist-50'].join(' ')}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={['px-4 py-3 text-ink-800', className].join(' ')}>{children}</td>;
}

// ─── ConfidencePill ───────────────────────────────────────────────────────
export function ConfidencePill({ value }: { value: number }) {
  const cls = value >= 95
    ? 'bg-green-100 text-success'
    : value >= 75
    ? 'bg-yellow-100 text-warning'
    : 'bg-red-100 text-danger';
  return (
    <span className={['inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums', cls].join(' ')}>
      {value}%
    </span>
  );
}

// ─── TabBar ───────────────────────────────────────────────────────────────
interface TabBarProps {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}
export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-0 border-b border-border mb-6">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={[
            'px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
            t === active ? 'border-brand-500 text-brand-600' : 'border-transparent text-ink-400 hover:text-ink-800',
          ].join(' ')}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
