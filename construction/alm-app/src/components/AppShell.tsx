import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, Upload, Zap, AlertTriangle, PenLine, RefreshCw, FileText, FolderOpen, Layers, BookOpen, Settings, Users, HelpCircle, ChevronDown } from 'lucide-react';
import { CURRENT_USER } from '../data/mock';

interface NavItemDef {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function NavItem({ to, icon, label, badge }: NavItemDef) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-2.5 px-6 py-2.5 text-sm font-medium border-l-[3px] transition-colors duration-150',
          isActive
            ? 'border-l-brand-500 bg-brand-500/10 text-brand-500 font-semibold'
            : 'border-l-transparent text-ink-400 hover:bg-white/[.06] hover:text-white',
        ].join(' ')
      }
    >
      <span className="w-5 text-center flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

function NavSection({ label }: { label: string }) {
  return (
    <p className="px-6 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-ink-400">
      {label}
    </p>
  );
}

export default function AppShell() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-mist-50">
      {/* Top bar */}
      <header className="h-16 bg-ink-950 border-b-[3px] border-brand-500 flex items-center px-8 gap-4 flex-shrink-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-white tracking-tight">
            Azets <span className="text-brand-500">ALM</span>
          </span>
        </button>
        <span className="text-[11px] font-medium text-ink-400 uppercase tracking-widest hidden sm:block">
          Automated Ledger Mapping
        </span>

        <div className="flex-1" />

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-ink-800 text-ink-400 hover:text-white transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border-2 border-ink-950" />
        </button>

        {/* User */}
        <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-ink-950 flex-shrink-0">
            {CURRENT_USER.avatarInitials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-white leading-tight">{CURRENT_USER.name}</p>
            <p className="text-[11px] text-ink-400 leading-tight">{CURRENT_USER.role} · {CURRENT_USER.organisation}</p>
          </div>
          <ChevronDown size={14} className="text-ink-400" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-60 bg-ink-950 flex flex-col overflow-y-auto flex-shrink-0 py-3" aria-label="Primary navigation">
          <NavSection label="Main" />
          <NavItem to="/dashboard"   icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <NavItem to="/upload"      icon={<Upload size={16} />}          label="Upload Accounts" />
          <NavItem to="/mapping"     icon={<Zap size={16} />}             label="Mapping Engine" />
          <NavItem to="/exceptions"  icon={<AlertTriangle size={16} />}   label="Exception Queue" badge={7} />
          <NavItem to="/workbench"   icon={<PenLine size={16} />}         label="Manual Workbench" />
          <NavItem to="/sync"        icon={<RefreshCw size={16} />}       label="Cozone Sync" />
          <NavItem to="/audit"       icon={<FileText size={16} />}        label="Audit Reports" />

          <NavSection label="Management" />
          <NavItem to="/history"     icon={<FolderOpen size={16} />}      label="History Portal" />
          <NavItem to="/bulk"        icon={<Layers size={16} />}          label="Bulk Operations" />
          <NavItem to="/ledger"      icon={<BookOpen size={16} />}        label="Master Ledger" />
          <NavItem to="/rules"       icon={<Settings size={16} />}        label="Rules Engine" />

          <NavSection label="Admin" />
          <NavItem to="/users"       icon={<Users size={16} />}           label="Users &amp; Access" />
          <NavItem to="/analytics"   icon={<LayoutDashboard size={16} />} label="Analytics" />
          <NavItem to="/help"        icon={<HelpCircle size={16} />}      label="Help &amp; Support" />
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8 focus:outline-none" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
