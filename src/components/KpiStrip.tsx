import { Car, CheckCircle2, Clock, Radio } from 'lucide-react';
import { GateBarrier, ParkingBay } from '../types/telemetry';

interface KpiStripProps {
  bays: ParkingBay[];
  gates: GateBarrier[];
}

export function KpiStrip({ bays, gates }: KpiStripProps) {
  const total = bays.length;
  const available = bays.filter((b) => b.status === 'available').length;
  const occupied = bays.filter((b) => b.status === 'occupied').length;
  const reserved = bays.filter((b) => b.status === 'reserved').length;
  const offline = bays.filter((b) => b.status === 'offline').length;

  const activeCapacity = Math.max(1, total - offline);
  const occupancyPct = Math.round(((occupied + reserved) / activeCapacity) * 100);
  const openGateCount = gates.filter((g) => g.angle > 10).length;

  // Radial gauge SVG geometry
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancyPct / 100) * circumference;

  return (
    <section
      aria-label="Facility Capacity Summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {/* KPI 1: Available Bays + Radial Gauge */}
      <div className="glass-panel rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Available Bays</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-semibold text-[#F8FAFC]">
              {available}
            </span>
            <span className="font-mono tabular-nums text-xs text-[#10B981]">
              of {total} slots
            </span>
          </div>
        </div>

        {/* Radial Occupancy Gauge */}
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#1F293D"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#00F0FF"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>
          <span className="absolute font-mono tabular-nums text-[11px] font-semibold text-[#F8FAFC]">
            {occupancyPct}%
          </span>
        </div>
      </div>

      {/* KPI 2: Occupied Vehicles */}
      <div className="glass-panel rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8]">
            <Car className="h-3.5 w-3.5 text-[#EF4444]" />
            <span>Occupied Bays</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-semibold text-[#F8FAFC]">
              {occupied}
            </span>
            <span className="font-mono tabular-nums text-xs text-[#94A3B8]">
              IR LOW active
            </span>
          </div>
        </div>
        <span className="rounded border border-[#EF4444]/30 bg-[#EF4444]/10 px-2 py-1 font-mono text-[11px] font-medium text-[#EF4444]">
          OCCUPIED
        </span>
      </div>

      {/* KPI 3: Reserved / In-Transit Holds */}
      <div className="glass-panel rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8]">
            <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>Reserved Holds</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-semibold text-[#F8FAFC]">
              {reserved}
            </span>
            <span className="font-mono tabular-nums text-xs text-[#F59E0B]">
              pending arrival
            </span>
          </div>
        </div>
        <span className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2 py-1 font-mono text-[11px] font-medium text-[#F59E0B]">
          HOLD
        </span>
      </div>

      {/* KPI 4: Gate & Sensor Diagnostics */}
      <div className="glass-panel rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8]">
            <Radio className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>Barrier Actuators</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-semibold text-[#F8FAFC]">
              {openGateCount > 0 ? `${openGateCount} OPEN` : 'SECURED'}
            </span>
            <span className="font-mono tabular-nums text-xs text-[#94A3B8]">
              {offline > 0 ? `${offline} bay offline` : 'all sensors nominal'}
            </span>
          </div>
        </div>
        <span className="rounded border border-[#1F293D] bg-[#0B0F19] px-2 py-1 font-mono text-[11px] font-medium text-[#00F0FF]">
          RC522
        </span>
      </div>
    </section>
  );
}
