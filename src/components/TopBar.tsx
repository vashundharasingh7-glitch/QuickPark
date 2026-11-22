import { Pause, Play, Plus, Search, X } from 'lucide-react';
import { ActiveScreen } from '../types/telemetry';

interface TopBarProps {
  activeScreen: ActiveScreen;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  liveStreamActive: boolean;
  onToggleLiveStream: () => void;
  onOpenReserveModal: () => void;
}

const SCREEN_TITLES: Record<ActiveScreen, { section: string; title: string }> = {
  cockpit: { section: 'Facility Operations', title: 'Live Bay Floorplan' },
  hardware: { section: 'IoT Infrastructure', title: 'Hardware & Gate Barriers' },
  logs: { section: 'Security & Fleet', title: 'Access Logs & ALPR Registry' },
  analytics: { section: 'Capacity Intelligence', title: 'Occupancy & Load Trends' },
};

export function TopBar({
  activeScreen,
  searchQuery,
  onSearchChange,
  liveStreamActive,
  onToggleLiveStream,
  onOpenReserveModal,
}: TopBarProps) {
  const meta = SCREEN_TITLES[activeScreen];

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-[#1F293D] bg-[#0B0F19]/90 backdrop-blur-md px-4 py-3.5 sm:px-6 lg:px-8">
      {/* Contextual Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="hidden sm:inline text-xs font-medium text-[#64748B] whitespace-nowrap">
          {meta.section}
        </span>
        <span className="hidden sm:inline text-xs text-[#334155]" aria-hidden="true">
          /
        </span>
        <h1 className="font-display text-base sm:text-lg font-semibold tracking-tight text-[#F8FAFC] truncate">
          {meta.title}
        </h1>
      </div>

      {/* Controls Cluster: ALPR Search + Stream Toggle + Primary CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* ALPR Monospace Auto-Uppercase Search */}
        <div className="relative hidden md:block w-56 lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value.toUpperCase())}
            placeholder="ALPR PLATE OR BAY..."
            aria-label="Search ALPR license plate or bay code"
            className="input-obsidian w-full rounded py-1.5 pl-8 pr-8 font-mono text-xs uppercase tracking-wider placeholder:text-[#64748B]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#F8FAFC]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Live Telemetry Stream Toggle */}
        <button
          type="button"
          onClick={onToggleLiveStream}
          className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            liveStreamActive
              ? 'border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/15'
              : 'border-[#1F293D] bg-[#111827] text-[#94A3B8] hover:border-[#38BDF8] hover:text-[#F8FAFC]'
          }`}
        >
          {liveStreamActive ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>Telemetry Live</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5" />
              <span>Stream Paused</span>
            </>
          )}
        </button>

        {/* Primary Action CTA */}
        <button
          type="button"
          onClick={onOpenReserveModal}
          className="btn-primary-cyan inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Reserve Bay</span>
        </button>
      </div>
    </header>
  );
}
