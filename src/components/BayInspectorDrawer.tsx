import {
  Car,
  CheckCircle2,
  Clock,
  Cpu,
  Radio,
  WifiOff,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { ParkingBay } from '../types/telemetry';
import { formatCountdown } from './BayFloorplanScreen';

interface BayInspectorDrawerProps {
  bay: ParkingBay | null;
  onClose: () => void;
  onReserveBay: (bayId: string) => void;
  onSimulateEntry: (bayId: string) => void;
  onSimulateExit: (bayId: string) => void;
  onClearHold: (bayId: string) => void;
  onToggleOffline: (bayId: string) => void;
}

export function BayInspectorDrawer({
  bay,
  onClose,
  onReserveBay,
  onSimulateEntry,
  onSimulateExit,
  onClearHold,
  onToggleOffline,
}: BayInspectorDrawerProps) {
  if (!bay) return null;

  const statusConfig = {
    available: {
      label: 'AVAILABLE',
      color: 'text-[#10B981] border-[#10B981]/40 bg-[#10B981]/10',
      icon: CheckCircle2,
    },
    occupied: {
      label: 'OCCUPIED',
      color: 'text-[#EF4444] border-[#EF4444]/40 bg-[#EF4444]/10',
      icon: Car,
    },
    reserved: {
      label: 'RESERVED',
      color: 'text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10',
      icon: Clock,
    },
    offline: {
      label: 'OFFLINE',
      color: 'text-[#94A3B8] border-[#64748B]/50 bg-[#64748B]/15',
      icon: WifiOff,
    },
  }[bay.status];

  const StatusIcon = statusConfig.icon;
  // Normalize ultrasonic/IR distance bar (10cm = full proximity, 220cm = clear)
  const proximityPct =
    bay.status === 'offline'
      ? 0
      : Math.max(8, Math.min(100, Math.round(((230 - bay.irDistanceCm) / 215) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[2px]">
      <div
        className="glass-overlay h-full w-full max-w-md overflow-y-auto p-6 flex flex-col justify-between"
        role="dialog"
        aria-label={`Bay ${bay.code} Telemetry Inspector`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#334155] pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-mono text-2xl font-bold text-[#F8FAFC]">{bay.code}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-medium ${statusConfig.color}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  <span>{statusConfig.label}</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-[#94A3B8]">
                {bay.zoneLabel} · Updated {bay.lastUpdated}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="rounded border border-[#334155] bg-[#0B0F19] p-1.5 text-[#94A3B8] hover:border-[#00F0FF] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hardware Binding Telemetry */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Hardware Node Binding
            </h3>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#334155] bg-[#0B0F19]/80 p-3.5">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Cpu className="h-3 w-3 text-[#00F0FF]" />
                  <span>Microcontroller</span>
                </div>
                <div className="mt-1 font-mono text-xs font-medium text-[#F8FAFC]">
                  {bay.nodeId}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Radio className="h-3 w-3 text-[#00F0FF]" />
                  <span>IR Array Pin</span>
                </div>
                <div className="mt-1 font-mono text-xs font-medium text-[#F8FAFC]">
                  GPIO {bay.gpioPin} · {bay.irState}
                </div>
              </div>
            </div>

            {/* IR Echo Proximity Bar */}
            <div className="rounded-lg border border-[#334155] bg-[#0B0F19]/80 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">IR / Ultrasonic Echo Distance</span>
                <span className="font-mono tabular-nums font-semibold text-[#F8FAFC]">
                  {bay.status === 'offline' ? 'TIMEOUT' : `${bay.irDistanceCm} cm`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1F293D]">
                <div
                  className={`h-full transition-all duration-300 ${
                    bay.irState === 'LOW' ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                  }`}
                  style={{ width: `${proximityPct}%` }}
                />
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#64748B]">
                <span>0 cm (Occupied)</span>
                <span>Threshold: 45 cm</span>
                <span>220 cm (Clear)</span>
              </div>
            </div>
          </div>

          {/* Vehicle / Reservation Assignment */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
              Vehicle &amp; Clearance Assignment
            </h3>
            {bay.plate || bay.rfidUid ? (
              <div className="rounded-lg border border-[#334155] bg-[#0B0F19]/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">ALPR License Plate</span>
                  <span className="rounded border border-[#334155] bg-[#111827] px-2.5 py-1 font-mono text-sm font-bold tracking-wider text-[#F8FAFC]">
                    {bay.plate}
                  </span>
                </div>
                {bay.driverName && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Driver / Fleet Unit</span>
                    <span className="font-medium text-[#F8FAFC]">{bay.driverName}</span>
                  </div>
                )}
                {bay.rfidUid && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">RC522 RFID UID</span>
                    <span className="font-mono text-[#00F0FF]">{bay.rfidUid}</span>
                  </div>
                )}
                {bay.status === 'reserved' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Hold Countdown</span>
                    <span className="font-mono tabular-nums font-semibold text-[#F59E0B]">
                      {formatCountdown(bay.reservedSecondsLeft)}
                    </span>
                  </div>
                )}
                {bay.occupiedSince && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Session Started</span>
                    <span className="font-mono tabular-nums text-[#F8FAFC]">
                      {bay.occupiedSince}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#334155] bg-[#0B0F19]/50 p-4 text-xs text-[#94A3B8]">
                {bay.status === 'offline'
                  ? 'Bay sensor is currently offline for maintenance calibration.'
                  : 'No vehicle or active reservation assigned to this bay.'}
              </div>
            )}

            {bay.evChargerKw && (
              <div className="flex items-center justify-between rounded-lg border border-[#00F0FF]/25 bg-[#00F0FF]/5 px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#00F0FF]">
                  <Zap className="h-3.5 w-3.5" />
                  <span>EV Pedestal Capacity</span>
                </div>
                <span className="font-mono tabular-nums font-semibold text-[#F8FAFC]">
                  {bay.evChargerKw.toFixed(1)} kW
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="mt-8 space-y-2.5 border-t border-[#334155] pt-5">
          {bay.status === 'available' && (
            <>
              <button
                type="button"
                onClick={() => onReserveBay(bay.id)}
                className="btn-primary-cyan w-full rounded px-4 py-2.5 text-xs"
              >
                Reserve Bay {bay.code}
              </button>
              <button
                type="button"
                onClick={() => onSimulateEntry(bay.id)}
                className="w-full rounded border border-[#334155] bg-[#111827] px-4 py-2.5 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:bg-[#1E293B]"
              >
                Simulate Vehicle Entry (IR Break)
              </button>
            </>
          )}

          {bay.status === 'reserved' && (
            <>
              <button
                type="button"
                onClick={() => onSimulateEntry(bay.id)}
                className="btn-primary-cyan w-full rounded px-4 py-2.5 text-xs"
              >
                Confirm Arrival (IR Break)
              </button>
              <button
                type="button"
                onClick={() => onClearHold(bay.id)}
                className="w-full rounded border border-[#334155] bg-[#111827] px-4 py-2.5 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:bg-[#1E293B]"
              >
                Release Reservation Hold
              </button>
            </>
          )}

          {bay.status === 'occupied' && (
            <button
              type="button"
              onClick={() => onSimulateExit(bay.id)}
              className="btn-primary-cyan w-full rounded px-4 py-2.5 text-xs"
            >
              Simulate Vehicle Departure
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleOffline(bay.id)}
            className={`inline-flex w-full items-center justify-center gap-2 rounded border px-4 py-2.5 text-xs font-medium transition-colors ${
              bay.status === 'offline'
                ? 'border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20'
                : 'border-[#EF4444]/60 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>
              {bay.status === 'offline'
                ? 'Restore Bay Sensor Online'
                : 'Flag Diagnostic Offline'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
