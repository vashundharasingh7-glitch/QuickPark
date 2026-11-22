import { useState } from 'react';
import { Clock, TrendingUp, Zap } from 'lucide-react';
import { HOURLY_UTILIZATION, ZONES } from '../data/initialTelemetry';
import { GateBarrier, ParkingBay } from '../types/telemetry';

interface AnalyticsScreenProps {
  bays: ParkingBay[];
  gates: GateBarrier[];
}

export function AnalyticsScreen({ bays, gates }: AnalyticsScreenProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(8); // Default focus at peak 08:00
  const [metricView, setMetricView] = useState<'occupancy' | 'evLoad'>('occupancy');

  const totalCycles = gates.reduce((acc, g) => acc + g.cyclesToday, 0);
  const activeEvKw = bays
    .filter((b) => b.status === 'occupied' && b.evChargerKw)
    .reduce((acc, b) => acc + (b.evChargerKw ?? 0), 0);

  const chartWidth = 760;
  const chartHeight = 240;
  const padLeft = 40;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 32;
  const innerWidth = chartWidth - padLeft - padRight;
  const innerHeight = chartHeight - padTop - padBottom;

  const maxValue = metricView === 'occupancy' ? 100 : 280;

  const points = HOURLY_UTILIZATION.map((d, i) => {
    const val = metricView === 'occupancy' ? d.occupancyPct : d.evLoadKw;
    const x = padLeft + (i / (HOURLY_UTILIZATION.length - 1)) * innerWidth;
    const y = padTop + innerHeight - (val / maxValue) * innerHeight;
    return { x, y, val, ...d };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
    padTop + innerHeight
  ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + innerHeight).toFixed(1)} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[8];

  return (
    <div className="space-y-6">
      {/* Top Analytical Summary Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <TrendingUp className="h-3.5 w-3.5 text-[#00F0FF]" />
            <span>24h Peak Occupancy</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-semibold text-[#F8FAFC]">
              92%
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">09:00 window</span>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Clock className="h-3.5 w-3.5 text-[#3B82F6]" />
            <span>Gate Actuator Cycles</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-semibold text-[#F8FAFC]">
              {totalCycles}
            </span>
            <span className="font-mono text-xs text-[#10B981]">99.6% clearance</span>
          </div>
        </div>

        <div className="glass-panel rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <Zap className="h-3.5 w-3.5 text-[#10B981]" />
            <span>Active EV Pedestal Draw</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-semibold text-[#F8FAFC]">
              {activeEvKw.toFixed(1)} kW
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">across Zones A &amp; B</span>
          </div>
        </div>
      </div>

      {/* Main SVG Precision Telemetry Chart */}
      <div className="glass-panel rounded-xl p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1F293D] pb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
              24-Hour Bay Utilization &amp; EV Load Profile
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Hover across time intervals to inspect hourly occupancy saturation and EV kW draw
            </p>
          </div>

          <div className="flex items-center gap-1 rounded bg-[#0B0F19] p-1 border border-[#1F293D] w-fit">
            <button
              type="button"
              onClick={() => setMetricView('occupancy')}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                metricView === 'occupancy'
                  ? 'bg-[#1E293B] text-[#00F0FF] border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
              }`}
            >
              Occupancy %
            </button>
            <button
              type="button"
              onClick={() => setMetricView('evLoad')}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                metricView === 'evLoad'
                  ? 'bg-[#1E293B] text-[#00F0FF] border border-[#334155]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] border border-transparent'
              }`}
            >
              EV Load (kW)
            </button>
          </div>
        </div>

        {/* Active Inspection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#1F293D] bg-[#0B0F19]/80 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-[#00F0FF]">
              {activePoint.hour}
            </span>
            <span className="text-[#64748B]">·</span>
            <span className="text-[#94A3B8]">
              Occupancy:{' '}
              <strong className="font-mono tabular-nums text-[#F8FAFC]">
                {activePoint.occupancyPct}%
              </strong>
            </span>
            <span className="text-[#64748B]">·</span>
            <span className="text-[#94A3B8]">
              Entries:{' '}
              <strong className="font-mono tabular-nums text-[#F8FAFC]">
                {activePoint.entries}/hr
              </strong>
            </span>
          </div>
          <div className="font-mono tabular-nums text-[#10B981]">
            EV Draw: {activePoint.evLoadKw} kW
          </div>
        </div>

        {/* Interactive SVG Area Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-[540px] h-64 select-none"
          >
            <defs>
              <linearGradient id="cyanAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padTop + innerHeight - ratio * innerHeight;
              const label = Math.round(ratio * maxValue);
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartWidth - padRight}
                    y2={y}
                    stroke="#1F293D"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Area Fill + Stroke */}
            <path d={areaPath} fill="url(#cyanAreaFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Vertical Hover Guide */}
            <line
              x1={activePoint.x}
              y1={padTop}
              x2={activePoint.x}
              y2={padTop + innerHeight}
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Interactive Hit Points */}
            {points.map((p, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g
                  key={p.hour}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  className="cursor-pointer"
                >
                  <rect
                    x={p.x - 14}
                    y={padTop}
                    width="28"
                    height={innerHeight + 16}
                    fill="transparent"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5 : 2.5}
                    fill={isHovered ? '#00F0FF' : '#0B0F19'}
                    stroke="#00F0FF"
                    strokeWidth="2"
                  />
                  {idx % 3 === 0 && (
                    <text
                      x={p.x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fill={isHovered ? '#F8FAFC' : '#64748B'}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {p.hour}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Zone Saturation Matrix */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <h3 className="font-display text-sm font-semibold text-[#F8FAFC]">
          Zone Capacity Breakdown
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ZONES.map((zone) => {
            const zBays = bays.filter((b) => b.zoneId === zone.id);
            const occ = zBays.filter((b) => b.status === 'occupied').length;
            const res = zBays.filter((b) => b.status === 'reserved').length;
            const avail = zBays.filter((b) => b.status === 'available').length;
            const pct = Math.round(((occ + res) / zBays.length) * 100);

            return (
              <div
                key={zone.id}
                className="rounded-lg border border-[#1F293D] bg-[#0B0F19]/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F8FAFC]">{zone.name}</span>
                  <span className="font-mono tabular-nums text-xs text-[#00F0FF]">
                    {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#1F293D] flex">
                  <div
                    className="h-full bg-[#EF4444]"
                    style={{ width: `${(occ / zBays.length) * 100}%` }}
                  />
                  <div
                    className="h-full bg-[#F59E0B]"
                    style={{ width: `${(res / zBays.length) * 100}%` }}
                  />
                  <div
                    className="h-full bg-[#10B981]"
                    style={{ width: `${(avail / zBays.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[11px] text-[#94A3B8]">
                  <span>{occ} OCC</span>
                  <span>{res} HOLD</span>
                  <span className="text-[#10B981]">{avail} FREE</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
