import {
  ArrowDownRight,
  ArrowUpRight,
  Car,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  WifiOff,
  Zap,
} from 'lucide-react';
import { ZONES } from '../data/initialTelemetry';
import {
  AccessEvent,
  ActiveScreen,
  BayStatus,
  GateBarrier,
  ParkingBay,
  ZoneId,
} from '../types/telemetry';

interface BayFloorplanScreenProps {
  bays: ParkingBay[];
  gates: GateBarrier[];
  recentEvents: AccessEvent[];
  selectedBayId: string | null;
  onSelectBay: (bayId: string) => void;
  zoneFilter: ZoneId | 'all';
  onZoneFilterChange: (zone: ZoneId | 'all') => void;
  statusFilter: BayStatus | 'all';
  onStatusFilterChange: (status: BayStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleGate: (gateId: string) => void;
  onNavigateScreen: (screen: ActiveScreen) => void;
}

export function formatCountdown(seconds?: number): string {
  if (seconds === undefined || seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function BayFloorplanScreen({
  bays,
  gates,
  recentEvents,
  selectedBayId,
  onSelectBay,
  zoneFilter,
  onZoneFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onToggleGate,
  onNavigateScreen,
}: BayFloorplanScreenProps) {
  const normalizedQuery = searchQuery.trim().toUpperCase();

  const matchesFilters = (bay: ParkingBay) => {
    if (zoneFilter !== 'all' && bay.zoneId !== zoneFilter) return false;
    if (statusFilter !== 'all' && bay.status !== statusFilter) return false;
    if (normalizedQuery) {
      const codeMatch = bay.code.toUpperCase().includes(normalizedQuery);
      const plateMatch = bay.plate?.toUpperCase().includes(normalizedQuery) ?? false;
      const driverMatch = bay.driverName?.toUpperCase().includes(normalizedQuery) ?? false;
      const uidMatch = bay.rfidUid?.toUpperCase().includes(normalizedQuery) ?? false;
      return codeMatch || plateMatch || driverMatch || uidMatch;
    }
    return true;
  };

  const visibleZones = ZONES.filter((z) => zoneFilter === 'all' || z.id === zoneFilter);
  const totalFilteredBays = bays.filter(matchesFilters).length;

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="glass-panel rounded-lg p-3.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Zone Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 rounded bg-[#0B0F19] p-1 border border-[#1F293D]">
          <button
            type="button"
            onClick={() => onZoneFilterChange('all')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              zoneFilter === 'all'
                ? 'bg-[#1E293B] text-[#00F0FF] border border-[#334155]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
            }`}
          >
            All Zones
          </button>
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => onZoneFilterChange(zone.id)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                zoneFilter === zone.id
                  ? 'bg-[#1E293B] text-[#00F0FF] border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>

        {/* Status Filter + Mobile Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 md:hidden min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
              placeholder="ALPR OR BAY..."
              className="input-obsidian w-full rounded py-1.5 pl-8 pr-3 font-mono text-xs uppercase"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'All States' },
                { id: 'available', label: 'Available' },
                { id: 'occupied', label: 'Occupied' },
                { id: 'reserved', label: 'Reserved' },
                { id: 'offline', label: 'Offline' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusFilterChange(opt.id)}
                className={`rounded border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === opt.id
                    ? 'border-[#00F0FF]/60 bg-[#00F0FF]/10 text-[#00F0FF]'
                    : 'border-[#1F293D] bg-[#0B0F19] text-[#94A3B8] hover:border-[#334155] hover:text-[#F8FAFC]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 12-Col Floorplan + Hardware Feed */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* 2D Interactive Parking Bay Canvas (8 cols on xl) */}
        <div className="xl:col-span-8 glass-panel rounded-xl p-4 sm:p-5 space-y-5">
          {/* Gate Access Lane Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1F293D] pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                2D Sensor Array Floorplan
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Click any parking bay to inspect IR beam telemetry, RFID binding, or dispatch a manual override.
              </p>
            </div>

            {/* Live Barrier Gate Chips */}
            <div className="flex flex-wrap items-center gap-2">
              {gates.map((gate) => {
                const isOpen = gate.angle > 10;
                return (
                  <button
                    key={gate.id}
                    type="button"
                    disabled={gate.locked}
                    onClick={() => onToggleGate(gate.id)}
                    title={gate.locked ? 'Gate locked by emergency halt' : 'Toggle servo barrier'}
                    className={`inline-flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-[11px] transition-all whitespace-nowrap shrink-0 ${
                      gate.locked
                        ? 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444] cursor-not-allowed'
                        : isOpen
                        ? 'border-[#00F0FF]/60 bg-[#00F0FF]/10 text-[#00F0FF]'
                        : 'border-[#1F293D] bg-[#0B0F19] text-[#F8FAFC] hover:border-[#38BDF8]'
                    }`}
                  >
                    {gate.locked ? (
                      <Lock className="h-3 w-3 text-[#EF4444]" />
                    ) : gate.direction === 'ENTRY' ? (
                      <ArrowDownRight className="h-3.5 w-3.5 text-[#10B981]" />
                    ) : (
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#3B82F6]" />
                    )}
                    <span>{gate.id}</span>
                    <span className="text-[#64748B]">|</span>
                    <span className="tabular-nums">
                      {gate.locked ? 'LOCKED' : `${gate.angle}° ${isOpen ? 'OPEN' : 'CLOSED'}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty Search State */}
          {totalFilteredBays === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#334155] bg-[#0B0F19]/60 py-14 text-center px-4">
              <Car className="h-8 w-8 text-[#64748B] mb-2" />
              <p className="text-sm font-medium text-[#F8FAFC]">No bays match active filters</p>
              <p className="mt-1 text-xs text-[#94A3B8]">
                Clear the ALPR plate search or switch back to All States to view the full grid.
              </p>
              <button
                type="button"
                onClick={() => {
                  onZoneFilterChange('all');
                  onStatusFilterChange('all');
                  onSearchChange('');
                }}
                className="mt-4 rounded border border-[#1F293D] bg-[#111827] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {visibleZones.map((zone) => {
                const zoneBays = bays.filter(
                  (b) => b.zoneId === zone.id && matchesFilters(b)
                );
                if (zoneBays.length === 0) return null;

                const availCount = zoneBays.filter((b) => b.status === 'available').length;

                return (
                  <div key={zone.id} className="space-y-3">
                    {/* Zone Lane Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-[#F8FAFC]">
                          {zone.name}
                        </span>
                        <span className="text-[#64748B]">·</span>
                        <span className="font-mono tabular-nums text-[#94A3B8]">
                          {availCount} available
                        </span>
                      </div>
                      {zone.evEnabled && (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#00F0FF]">
                          <Zap className="h-3 w-3" />
                          <span>EV Pedestals</span>
                        </span>
                      )}
                    </div>

                    {/* 4-column Subgrid of Parking Bays */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {zoneBays.map((bay) => {
                        const isSelected = selectedBayId === bay.id;
                        const statusStyles =
                          bay.status === 'available'
                            ? 'border-[#10B981]/40 bg-[#10B981]/[0.05] hover:border-[#10B981] glow-available'
                            : bay.status === 'occupied'
                            ? 'border-[#EF4444]/30 bg-[#EF4444]/[0.04] hover:border-[#EF4444]/70 glow-occupied'
                            : bay.status === 'reserved'
                            ? 'border-[#F59E0B]/50 bg-[#F59E0B]/[0.06] hover:border-[#F59E0B] glow-reserved'
                            : 'border-[#64748B]/40 bg-[#64748B]/[0.06] hover:border-[#64748B]';

                        return (
                          <button
                            key={bay.id}
                            type="button"
                            onClick={() => onSelectBay(bay.id)}
                            className={`group relative flex flex-col justify-between rounded-lg border p-3.5 text-left transition-all duration-150 ${statusStyles} ${
                              isSelected ? 'glow-active !border-[#00F0FF]' : ''
                            }`}
                          >
                            {/* Top Row: Bay Code + State Icon */}
                            <div className="flex w-full items-center justify-between gap-2">
                              <span className="font-mono text-sm font-bold tracking-tight text-[#F8FAFC]">
                                {bay.code}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-[11px] font-medium">
                                {bay.status === 'available' && (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                                    <span className="text-[#10B981]">FREE</span>
                                  </>
                                )}
                                {bay.status === 'occupied' && (
                                  <>
                                    <Car className="h-3.5 w-3.5 text-[#EF4444]" />
                                    <span className="text-[#EF4444]">OCC</span>
                                  </>
                                )}
                                {bay.status === 'reserved' && (
                                  <>
                                    <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
                                    <span className="tabular-nums text-[#F59E0B]">
                                      {formatCountdown(bay.reservedSecondsLeft)}
                                    </span>
                                  </>
                                )}
                                {bay.status === 'offline' && (
                                  <>
                                    <WifiOff className="h-3.5 w-3.5 text-[#64748B]" />
                                    <span className="text-[#64748B]">OFF</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Middle Row: Plate or Vacant Readout */}
                            <div className="my-3 min-h-[24px]">
                              {bay.plate ? (
                                <div className="font-mono text-xs font-semibold tracking-wider text-[#F8FAFC] truncate">
                                  {bay.plate}
                                </div>
                              ) : (
                                <div className="text-xs text-[#64748B]">
                                  {bay.status === 'offline' ? 'Sensor Fault' : 'Ready for Arrival'}
                                </div>
                              )}
                              {bay.driverName && (
                                <div className="text-[11px] text-[#94A3B8] truncate">
                                  {bay.driverName}
                                </div>
                              )}
                            </div>

                            {/* Bottom Row: IR Sensor Read + EV Rating */}
                            <div className="flex w-full items-center justify-between border-t border-[#1F293D]/80 pt-2 font-mono text-[10px] text-[#94A3B8]">
                              <span className="tabular-nums">
                                IR:{bay.irState} · {bay.irDistanceCm}cm
                              </span>
                              {bay.evChargerKw ? (
                                <span className="text-[#00F0FF] tabular-nums">
                                  {bay.evChargerKw}kW
                                </span>
                              ) : (
                                <span>STD</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Telemetry Feed Column (4 cols on xl) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Live Hardware Event Stream */}
          <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
              <div>
                <h2 className="font-display text-sm font-semibold text-[#F8FAFC]">
                  Gate &amp; Sensor Stream
                </h2>
                <p className="text-xs text-[#94A3B8]">Latest RC522, IR &amp; servo transitions</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateScreen('logs')}
                className="text-xs font-medium text-[#00F0FF] hover:underline whitespace-nowrap shrink-0"
              >
                Full Registry
              </button>
            </div>

            <div className="divide-y divide-[#1F293D]">
              {recentEvents.slice(0, 6).map((evt) => {
                const badgeColor =
                  evt.category === 'RFID_TAP'
                    ? 'border-[#00F0FF]/40 bg-[#00F0FF]/10 text-[#00F0FF]'
                    : evt.category === 'IR_BREAK_BEAM'
                    ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
                    : evt.category === 'SERVO_TIMEOUT'
                    ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]'
                    : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]';

                return (
                  <div key={evt.id} className="py-3 first:pt-1 last:pb-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium ${badgeColor}`}
                      >
                        {evt.category}
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-[#94A3B8]">
                        {evt.timestamp}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#CBD5E1]">{evt.detail}</p>
                    {(evt.bayCode || evt.plate || evt.gateId) && (
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#64748B]">
                        {evt.bayCode && <span>BAY {evt.bayCode}</span>}
                        {evt.gateId && <span>{evt.gateId}</span>}
                        {evt.plate && <span className="text-[#94A3B8]">{evt.plate}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Legend & Signal Reference */}
          <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
              Bay State Telemetry Key
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 rounded border border-[#10B981]/30 bg-[#10B981]/5 px-2.5 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0" />
                <span className="text-[#CBD5E1]">Available (IR HIGH)</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-[#EF4444]/30 bg-[#EF4444]/5 px-2.5 py-2">
                <Car className="h-3.5 w-3.5 text-[#EF4444] shrink-0" />
                <span className="text-[#CBD5E1]">Occupied (IR LOW)</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-[#F59E0B]/40 bg-[#F59E0B]/5 px-2.5 py-2">
                <Clock className="h-3.5 w-3.5 text-[#F59E0B] shrink-0" />
                <span className="text-[#CBD5E1]">Reserved Hold</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-[#64748B]/40 bg-[#64748B]/5 px-2.5 py-2">
                <WifiOff className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
                <span className="text-[#CBD5E1]">Diagnostic Offline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
