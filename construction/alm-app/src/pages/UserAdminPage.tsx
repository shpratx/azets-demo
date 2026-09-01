import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button, Card, Chip, DataTable, Tr, Td, PageHeader, TabBar, Ann } from '../components/ui';
import { USERS } from '../data/mock';
import type { Role } from '../types';

const roleVariant: Record<Role, string> = {
  FinanceManager: 'brand', Accountant: 'neutral', Auditor: 'info', Administrator: 'danger',
};

const roleLabel: Record<Role, string> = {
  FinanceManager: 'Finance Manager', Accountant: 'Accountant', Auditor: 'Auditor', Administrator: 'Administrator',
};

const permissions = [
  'Upload Files', 'Run Mapping', 'Review Queue', 'Approve Override', 'Sync Cozone', 'Generate Report', 'View History', 'Manage Users',
];

const rolePerms: Record<Role, boolean[]> = {
  FinanceManager:  [true, true, true, true, true, true, true, false],
  Accountant:      [true, false, true, true, false, false, true, false],
  Auditor:         [false, false, false, false, false, true, true, false],
  Administrator:   [true, true, true, true, true, true, true, true],
};

export default function UserAdminPage() {
  const [tab, setTab] = useState('Users');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = USERS.filter(u =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'All' || u.role === roleFilter)
  );

  const activeSessions = [
    { user: 'Priya Sharma', device: 'Chrome / macOS', ip: '10.0.x.x', loginTime: '09:14', duration: '2h 45m' },
    { user: 'Raj Patel', device: 'Firefox / Windows', ip: '10.0.x.x', loginTime: '08:30', duration: '3h 25m' },
    { user: 'James Muldoon', device: 'Safari / macOS', ip: '92.x.x.x', loginTime: '09:00', duration: '3h 00m' },
    { user: 'Tom Barnes', device: 'Chrome / Windows', ip: '10.0.x.x', loginTime: '07:50', duration: '4h 05m' },
    { user: 'Aisha Okonkwo', device: 'Chrome / macOS', ip: '10.0.x.x', loginTime: '09:30', duration: '2h 20m' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="User Administration"
        subtitle="Manage users, roles and access permissions"
        actions={
          <>
            <Ann>F0.2 Identity & Access</Ann>
            <Button variant="primary" size="sm">+ Invite User</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { l: 'Total Users', v: USERS.length },
          { l: 'Active Sessions', v: activeSessions.length },
          { l: 'Last Audit', v: '2h ago' },
        ].map(s => (
          <div key={s.l} className="bg-canvas border border-border rounded-card shadow-1 p-5">
            <p className="text-xs font-bold text-ink-400 uppercase tracking-wide mb-1">{s.l}</p>
            <p className="text-2xl font-semibold text-ink-950">{s.v}</p>
          </div>
        ))}
      </div>

      <TabBar tabs={['Users', 'Roles & Permissions', 'Active Sessions', 'Access Audit Log']} active={tab} onChange={setTab} />

      {tab === 'Users' && (
        <>
          <div className="flex gap-3 mb-1 flex-wrap">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
                className="w-full h-9 pl-8 pr-3 border border-border rounded-control text-sm focus-visible:outline-2 focus-visible:outline-focus" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="h-9 border border-border rounded-control px-3 text-sm bg-canvas">
              {['All', 'FinanceManager', 'Accountant', 'Auditor', 'Administrator'].map(r => <option key={r}>{r}</option>)}
            </select>
            <Ann>F0.2.2 RBAC</Ann>
          </div>
          <DataTable headers={['User', 'Email', 'Role', 'Organisation', 'Status', 'Last Login', 'Sessions', 'Actions']}>
            {filtered.map(u => (
              <Tr key={u.id}>
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-[10px] font-bold text-ink-950 flex-shrink-0">{u.avatarInitials}</div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </Td>
                <Td className="text-ink-400 text-xs">{u.email}</Td>
                <Td><Chip variant={roleVariant[u.role] as any} dot={false}>{roleLabel[u.role]}</Chip></Td>
                <Td className="text-sm">{u.organisation}</Td>
                <Td><Chip variant={u.status === 'Active' ? 'success' : u.status === 'Suspended' ? 'danger' : 'neutral'} dot>{u.status}</Chip></Td>
                <Td className="tabular-nums text-ink-400 text-xs">{new Date(u.lastLogin).toLocaleDateString('en-GB')}</Td>
                <Td className="tabular-nums text-center">{u.activeSessions}</Td>
                <Td>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant={u.status === 'Suspended' ? 'primary' : 'ghost'} size="sm">
                      {u.status === 'Suspended' ? 'Unsuspend' : 'Suspend'}
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </DataTable>
        </>
      )}

      {tab === 'Roles & Permissions' && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <h4 className="text-sm font-semibold text-ink-950">Role Permissions Matrix</h4>
            <Ann>F0.2.4 Fine-Grained Permissions</Ann>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-4 text-xs font-bold text-ink-400 uppercase tracking-wide">Permission</th>
                  {(['FinanceManager', 'Accountant', 'Auditor', 'Administrator'] as Role[]).map(r => (
                    <th key={r} className="text-center py-2 px-3 text-xs font-bold text-ink-400 uppercase tracking-wide">
                      {roleLabel[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((p, i) => (
                  <tr key={p} className={i % 2 === 0 ? 'bg-mist-50' : ''}>
                    <td className="py-2.5 pr-4 text-sm text-ink-800 font-medium">{p}</td>
                    {(['FinanceManager', 'Accountant', 'Auditor', 'Administrator'] as Role[]).map(r => (
                      <td key={r} className="py-2.5 px-3 text-center">
                        <span className={rolePerms[r][i] ? 'text-success text-base' : 'text-ink-200 text-base'}>
                          {rolePerms[r][i] ? '✓' : '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'Active Sessions' && (
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <h4 className="text-sm font-semibold text-ink-950">Active Sessions ({activeSessions.length})</h4>
            <Ann>F0.2.3 Session Management</Ann>
          </div>
          <DataTable headers={['User', 'Device', 'IP Address', 'Login Time', 'Duration', 'Actions']}>
            {activeSessions.map(s => (
              <Tr key={s.user}>
                <Td className="font-medium">{s.user}</Td>
                <Td className="text-sm text-ink-600">{s.device}</Td>
                <Td><code className="bg-mist-100 px-1.5 py-0.5 rounded text-xs font-mono">{s.ip}</code></Td>
                <Td className="tabular-nums">{s.loginTime}</Td>
                <Td className="tabular-nums text-ink-400">{s.duration}</Td>
                <Td><Button variant="danger" size="sm">Revoke</Button></Td>
              </Tr>
            ))}
          </DataTable>
        </Card>
      )}

      {tab === 'Access Audit Log' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold text-ink-950">Access Audit Log</h4>
            <Ann>F0.2.5 Access Audit</Ann>
          </div>
          <DataTable headers={['Time', 'User', 'Action', 'Resource', 'IP', 'Result']}>
            {[
              { t: '09:14', u: 'Priya Sharma', a: 'Login', r: 'Session', ip: '10.0.x.x', ok: true },
              { t: '09:18', u: 'Priya Sharma', a: 'Upload file', r: 'Session A-2024-089', ip: '10.0.x.x', ok: true },
              { t: '10:03', u: 'Raj Patel', a: 'Manual override', r: 'MUL-2847', ip: '10.0.x.x', ok: true },
              { t: '11:30', u: 'Unknown', a: 'Login attempt', r: 'Auth', ip: '94.x.x.x', ok: false },
              { t: '13:47', u: 'Priya Sharma', a: 'Approve sync', r: 'Session A-2024-089', ip: '10.0.x.x', ok: true },
            ].map((row, i) => (
              <Tr key={i}>
                <Td className="tabular-nums text-ink-400">{row.t}</Td>
                <Td>{row.u}</Td>
                <Td>{row.a}</Td>
                <Td className="text-xs text-ink-600">{row.r}</Td>
                <Td><code className="bg-mist-100 px-1.5 py-0.5 rounded text-xs font-mono">{row.ip}</code></Td>
                <Td><Chip variant={row.ok ? 'success' : 'danger'} dot={false}>{row.ok ? 'Success' : 'Blocked'}</Chip></Td>
              </Tr>
            ))}
          </DataTable>
        </Card>
      )}
    </div>
  );
}
