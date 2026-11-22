import { useState } from 'react';
import { Download, Plus, Search, ShieldCheck, UserPlus, X } from 'lucide-react';
import {
  AccessEvent,
  EventCategory,
  FleetCredential,
} from '../types/telemetry';

interface AccessLogsScreenProps {
  events: AccessEvent[];
  credentials: FleetCredential[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddCredential: (cred: Omit<FleetCredential, 'id' | 'active' | 'lastSeen'>) => void;
  onToggleCredentialActive: (credId: string) => void;
}

const CATEGORIES: ('ALL' | EventCategory)[] = [
  'ALL',
  'RFID_TAP',
  'IR_BREAK_BEAM',
  'SERVO_TIMEOUT',
  'GATE_OVERRIDE',
];

export function AccessLogsScreen({
  events,
  credentials,
  searchQuery,
  onSearchChange,
  onAddCredential,
  onToggleCredentialActive,
}: AccessLogsScreenProps) {
  const [subTab, setSubTab] = useState<'events' | 'registry'>('events');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | EventCategory>('ALL');
  const [showNewCredForm, setShowNewCredForm] = useState(false);

  const [newPlate, setNewPlate] = useState('');
  const [newUid, setNewUid] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newTier, setNewTier] = useState<FleetCredential['clearanceTier']>('Executive EV');

  const queryUpper = searchQuery.trim().toUpperCase();

  const filteredEvents = events.filter((evt) => {
    if (categoryFilter !== 'ALL' && evt.category !== categoryFilter) return false;
    if (queryUpper) {
      return (
        (evt.plate?.toUpperCase().includes(queryUpper) ?? false) ||
        (evt.bayCode?.toUpperCase().includes(queryUpper) ?? false) ||
        (evt.rfidUid?.toUpperCase().includes(queryUpper) ?? false) ||
        evt.detail.toUpperCase().includes(queryUpper)
      );
    }
    return true;
  });

  const filteredCredentials = credentials.filter((c) => {
    if (!queryUpper) return true;
    return (
      c.plate.toUpperCase().includes(queryUpper) ||
      c.rfidUid.toUpperCase().includes(queryUpper) ||
      c.driverName.toUpperCase().includes(queryUpper) ||
      c.fleetUnit.toUpperCase().includes(queryUpper)
    );
  });

  const handleDownloadCsv = () => {
    const headers = ['Timestamp', 'Category', 'Bay', 'Gate', 'Plate', 'RFID_UID', 'Detail'];
    const rows = filteredEvents.map((e) => [
      e.timestamp,
      e.category,
      e.bayCode ?? '',
      e.gateId ?? '',
      e.plate ?? '',
      e.rfidUid ?? '',
      `"${e.detail.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'obsidian-telemetry-access-logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate.trim() || !newUid.trim() || !newDriver.trim()) return;
    onAddCredential({
      plate: newPlate.trim().toUpperCase(),
      rfidUid: newUid.trim().toUpperCase(),
      driverName: newDriver.trim(),
      fleetUnit: newUnit.trim() || 'Enterprise Mobility',
      clearanceTier: newTier,
    });
    setNewPlate('');
    setNewUid('');
    setNewDriver('');
    setNewUnit('');
    setShowNewCredForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation & Toolbar */}
      <div className="glass-panel rounded-lg p-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1 rounded bg-[#0B0F19] p-1 border border-[#1F293D] w-fit">
          <button
            type="button"
            onClick={() => setSubTab('events')}
            className={`rounded px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              subTab === 'events'
                ? 'bg-[#1E293B] text-[#00F0FF] border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
            }`}
          >
            Hardware Event Log ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('registry')}
            className={`rounded px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              subTab === 'registry'
                ? 'bg-[#1E293B] text-[#00F0FF] border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
            }`}
          >
            ALPR &amp; RFID Registry ({credentials.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
              placeholder="FILTER PLATE OR UID..."
              className="input-obsidian w-full rounded py-1.5 pl-8 pr-7 font-mono text-xs uppercase"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear filter"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F8FAFC]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {subTab === 'events' ? (
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 rounded border border-[#1F293D] bg-[#111827] px-3.5 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8] whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-[#00F0FF]" />
              <span>Download CSV</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowNewCredForm((v) => !v)}
              className="btn-primary-cyan inline-flex items-center gap-1.5 rounded px-3.5 py-2 text-xs whitespace-nowrap shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'events' ? (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1F293D] pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded border px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'border-[#00F0FF]/60 bg-[#00F0FF]/10 text-[#00F0FF]'
                    : 'border-[#1F293D] bg-[#0B0F19] text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Event Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <th className="py-2.5 pr-4">Timestamp</th>
                  <th className="py-2.5 pr-4">Event Type</th>
                  <th className="py-2.5 pr-4">Node / Bay</th>
                  <th className="py-2.5 pr-4">ALPR / UID</th>
                  <th className="py-2.5">Telemetry Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[#94A3B8]">
                      No access events match the active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt, index) => {
                    const badgeStyle =
                      evt.category === 'RFID_TAP'
                        ? 'border-[#00F0FF]/40 bg-[#00F0FF]/10 text-[#00F0FF]'
                        : evt.category === 'IR_BREAK_BEAM'
                        ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
                        : evt.category === 'SERVO_TIMEOUT'
                        ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]'
                        : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]';

                    return (
                      <tr
                        key={evt.id}
                        className={index % 2 === 1 ? 'bg-[#0B0F19]/40' : 'bg-transparent'}
                      >
                        <td className="py-3 pr-4 font-mono tabular-nums text-[#94A3B8] whitespace-nowrap">
                          {evt.timestamp}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap">
                          <span
                            className={`rounded border px-2 py-0.5 font-mono text-[10px] font-medium ${badgeStyle}`}
                          >
                            {evt.category}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-[#F8FAFC] whitespace-nowrap">
                          {evt.bayCode ?? evt.gateId ?? '—'}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[#CBD5E1] whitespace-nowrap">
                          {evt.plate || evt.rfidUid ? (
                            <div className="flex items-center gap-2">
                              {evt.plate && <span>{evt.plate}</span>}
                              {evt.rfidUid && (
                                <span className="text-[#64748B]">{evt.rfidUid}</span>
                              )}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 text-[#CBD5E1] min-w-[260px]">{evt.detail}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {showNewCredForm && (
            <form
              onSubmit={handleCreateCredential}
              className="glass-panel rounded-xl p-5 space-y-4 border-[#00F0FF]/40"
            >
              <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
                <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
                  Register Authorized ALPR &amp; RFID Credential
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewCredForm(false)}
                  className="text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <input
                  type="text"
                  required
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                  placeholder="PLATE (E.G. CA-992-EV)"
                  className="input-obsidian rounded px-3 py-2 font-mono text-xs uppercase"
                />
                <input
                  type="text"
                  required
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value.toUpperCase())}
                  placeholder="RFID UID (04:B2:11:9C)"
                  className="input-obsidian rounded px-3 py-2 font-mono text-xs uppercase"
                />
                <input
                  type="text"
                  required
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  placeholder="Driver / Unit Name"
                  className="input-obsidian rounded px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Fleet Department"
                  className="input-obsidian rounded px-3 py-2 text-xs"
                />
                <select
                  value={newTier}
                  onChange={(e) =>
                    setNewTier(e.target.value as FleetCredential['clearanceTier'])
                  }
                  className="input-obsidian rounded px-3 py-2 text-xs"
                >
                  <option value="Executive EV">Executive EV</option>
                  <option value="Fleet Rapid">Fleet Rapid</option>
                  <option value="Contractor">Contractor</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCredForm(false)}
                  className="rounded border border-[#1F293D] bg-[#111827] px-4 py-2 text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-cyan inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Save Credential</span>
                </button>
              </div>
            </form>
          )}

          <div className="glass-panel rounded-xl p-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#1F293D] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <th className="py-2.5 pr-4">License Plate</th>
                  <th className="py-2.5 pr-4">RC522 UID</th>
                  <th className="py-2.5 pr-4">Driver / Fleet Unit</th>
                  <th className="py-2.5 pr-4">Clearance Zone</th>
                  <th className="py-2.5 pr-4">Last Gate Read</th>
                  <th className="py-2.5 text-right">Access State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F293D]">
                {filteredCredentials.map((cred, index) => (
                  <tr
                    key={cred.id}
                    className={index % 2 === 1 ? 'bg-[#0B0F19]/40' : 'bg-transparent'}
                  >
                    <td className="py-3 pr-4 font-mono font-semibold text-[#F8FAFC] whitespace-nowrap">
                      {cred.plate}
                    </td>
                    <td className="py-3 pr-4 font-mono text-[#00F0FF] whitespace-nowrap">
                      {cred.rfidUid}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-[#F8FAFC]">{cred.driverName}</div>
                      <div className="text-[11px] text-[#64748B]">{cred.fleetUnit}</div>
                    </td>
                    <td className="py-3 pr-4 text-[#CBD5E1] whitespace-nowrap">
                      {cred.clearanceTier}
                    </td>
                    <td className="py-3 pr-4 font-mono tabular-nums text-[#94A3B8] whitespace-nowrap">
                      {cred.lastSeen}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleCredentialActive(cred.id)}
                        className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                          cred.active
                            ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20'
                            : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20'
                        }`}
                      >
                        <ShieldCheck className="h-3 w-3" />
                        <span>{cred.active ? 'AUTHORIZED' : 'REVOKED'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
