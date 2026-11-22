import {
  Activity,
  BarChart3,
  Cpu,
  FileSpreadsheet,
  LayoutGrid,
  ShieldAlert,
} from 'lucide-react';
import { ActiveScreen } from '../types/telemetry';

interface SidebarProps {
  activeScreen: ActiveScreen;
  onSelectScreen: (screen: ActiveScreen) => void;
  availableCount: number;
  totalCount: number;
  onlineNodesCount: number;
  totalNodesCount: number;
  gateLocked: boolean;
}

const NAV_ITEMS: {
  id: ActiveScreen;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: 'cockpit', label: 'Bay Floorplan', icon: LayoutGrid },
  { id: 'hardware', label: 'Hardware & Gates', icon: Cpu },
  { id: 'logs', label: 'Access & ALPR', icon: FileSpreadsheet },
  { id: 'analytics', label: 'Occupancy Trends', icon: BarChart3 },
];

export function Sidebar({
  activeScreen,
  onSelectScreen,
  availableCount,
  totalCount,
  onlineNodesCount,
  totalNodesCount,
  gateLocked,
}: SidebarProps) {
  return (
    <>
      {/* Desktop Left Navigation Rail */}
      <aside className="hidden lg:flex lg:w-[252px] lg:shrink-0 lg:flex-col lg:justify-between border-r border-[#1F293D] bg-[#0B0F19]/95 px-4 py-5">
        <div className="space-y-6">
          {/* Brand Wordmark */}
          <div className="px-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF]">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-display text-base font-bold tracking-tight text-[#F8FAFC] whitespace-nowrap shrink-0">
                Obsidian Telemetry
              </span>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav aria-label="Primary Navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectScreen(item.id)}
                  className={`flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#111827] text-[#00F0FF] glow-active'
                      : 'text-[#94A3B8] hover:bg-[#111827]/70 hover:text-[#F8FAFC] border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Facility Hardware Summary */}
        <div className="space-y-3 border-t border-[#1F293D] pt-4 px-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">Open Capacity</span>
            <span className="font-mono tabular-nums font-semibold text-[#10B981]">
              {availableCount} / {totalCount} bays
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#94A3B8]">ESP32 Mesh</span>
            <span className="font-mono tabular-nums font-medium text-[#F8FAFC]">
              {onlineNodesCount}/{totalNodesCount} nodes
            </span>
          </div>
          {gateLocked && (
            <div className="flex items-center gap-2 rounded border border-[#EF4444]/60 bg-[#EF4444]/15 px-2.5 py-2 text-xs font-medium text-[#EF4444]">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>Barrier Halt Active</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Control Dock (Compact <= 15% height) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#1F293D] bg-[#0B0F19]/95 backdrop-blur-md px-2 py-2 lg:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectScreen(item.id)}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap ${
                isActive ? 'text-[#00F0FF]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate max-w-[76px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
