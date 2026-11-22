import { useState } from 'react';
import {
  AlertTriangle,
  Cpu,
  Lock,
  Radio,
  RotateCw,
  ShieldCheck,
  Unlock,
  Wifi,
} from 'lucide-react';
import {
  Esp32Node,
  FleetCredential,
  GateBarrier,
  ParkingBay,
} from '../types/telemetry';

interface HardwareTelemetryScreenProps {
  gates: GateBarrier[];
  nodes: Esp32Node[];
  bays: ParkingBay[];
  credentials: FleetCredential[];
  onToggleGate: (gateId: string) => void;
  onToggleGateLock: (gateId: string) => void;
  onSimulateRfidTap: (gateId: string, uid: string) => void;
  onSimulateIrBreak: (bayId: string) => void;
  onSimulateServoTimeout: (gateId: string) => void;
  onToggleNodeOnline: (nodeId: string) => void;
}

export function HardwareTelemetryScreen({
  gates,
  nodes,
  bays,
  credentials,
  onToggleGate,
  onToggleGateLock,
  onSimulateRfidTap,
  onSimulateIrBreak,
  onSimulateServoTimeout,
  onToggleNodeOnline,
}: HardwareTelemetryScreenProps) {
  const [selectedGateId, setSelectedGateId] = useState<string>(gates[0]?.id ?? 'GATE-IN-01');
  const [selectedUid, setSelectedUid] = useState<string>(
    credentials[0]?.rfidUid ?? '04:A3:91:2B'
  );
  const availableBays = bays.filter((b) => b.status === 'available');
  const [selectedBayId, setSelectedBayId] = useState<string>(
    availableBays[0]?.id ?? bays[0]?.id ?? ''
  );

  return (
    <div className="space-y-6">
      {/* Top Grid: Servo Barrier Actuators + Hardware Event Simulator */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Gate Barrier Actuators (7 cols) */}
        <div className="xl:col-span-7 grid grid-cols-1 gap-4 md:grid-cols-2">
          {gates.map((gate) => {
            const isOpen = gate.angle > 10;
            return (
              <div
                key={gate.id}
                className="glass-panel rounded-xl p-5 flex flex-col justify-between space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#F8FAFC]">
                        {gate.id}
                      </span>
                      <span className="rounded border border-[#1F293D] bg-[#0B0F19] px-1.5 py-0.5 font-mono text-[10px] text-[#00F0FF]">
                        {gate.servoModel}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#94A3B8]">{gate.name}</p>
                  </div>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[11px] font-semibold ${
                      gate.locked
                        ? 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444]'
                        : isOpen
                        ? 'border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981]'
                        : 'border-[#334155] bg-[#0B0F19] text-[#94A3B8]'
                    }`}
                  >
                    {gate.locked ? 'HALT LOCK' : isOpen ? '90° OPEN' : '0° CLOSED'}
                  </span>
                </div>

                {/* Mechanical Servo Arm SVG Visualizer */}
                <div className="relative flex h-32 items-center justify-center rounded-lg border border-[#1F293D] bg-[#0B0F19]/90 px-4">
                  <svg viewBox="0 0 240 100" className="h-24 w-full max-w-[230px]">
                    {/* Road Base */}
                    <line
                      x1="15"
                      y1="84"
                      x2="225"
                      y2="84"
                      stroke="#1F293D"
                      strokeWidth="2"
                    />
                    {/* Servo Pedestal */}
                    <rect
                      x="24"
                      y="46"
                      width="24"
                      height="38"
                      rx="3"
                      fill="#111827"
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                    {/* Pivot Axle */}
                    <circle cx="36" cy="56" r="5" fill="#00F0FF" />
                    {/* Rotating Barrier Arm */}
                    <g
                      style={{
                        transformOrigin: '36px 56px',
                        transform: `rotate(${gate.locked ? 0 : -gate.angle}deg)`,
                        transition: 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <rect
                        x="36"
                        y="52"
                        width="160"
                        height="8"
                        rx="2"
                        fill={gate.locked ? '#EF4444' : isOpen ? '#10B981' : '#F59E0B'}
                      />
                      {/* Reflective Stripes */}
                      <rect x="70" y="52" width="12" height="8" fill="#0B0F19" opacity="0.45" />
                      <rect x="115" y="52" width="12" height="8" fill="#0B0F19" opacity="0.45" />
                      <rect x="160" y="52" width="12" height="8" fill="#0B0F19" opacity="0.45" />
                    </g>
                    {/* Angle Readout */}
                    <text
                      x="220"
                      y="24"
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      θ = {gate.locked ? 0 : gate.angle}°
                    </text>
                  </svg>
                </div>

                {/* RC522 Module Readout */}
                <div className="space-y-2 rounded-lg border border-[#1F293D] bg-[#0B0F19]/60 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">RC522 Last UID</span>
                    <span className="font-mono text-[#00F0FF]">{gate.lastScannedUid}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Last Auth / Cycles</span>
                    <span className="font-mono tabular-nums text-[#F8FAFC]">
                      {gate.lastAuthResult} · {gate.cyclesToday} today
                    </span>
                  </div>
                </div>

                {/* Actuator Controls */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={gate.locked}
                    onClick={() => onToggleGate(gate.id)}
                    className={`rounded px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                      gate.locked
                        ? 'cursor-not-allowed border border-[#1F293D] bg-[#0B0F19] text-[#64748B]'
                        : isOpen
                        ? 'border border-[#38BDF8]/50 bg-[#1E293B] text-[#F8FAFC] hover:border-[#00F0FF]'
                        : 'btn-primary-cyan'
                    }`}
                  >
                    {isOpen ? 'Close Barrier (0°)' : 'Open Barrier (90°)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleGateLock(gate.id)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      gate.locked
                        ? 'border-[#10B981]/60 bg-[#10B981]/15 text-[#10B981] hover:bg-[#10B981]/25'
                        : 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25'
                    }`}
                  >
                    {gate.locked ? (
                      <>
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Release Halt</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        <span>Emergency Halt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Hardware Event Simulator (5 cols) */}
        <div className="xl:col-span-5 glass-panel rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-[#1F293D] pb-3">
              <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
                Hardware Signal Simulator
              </h2>
              <p className="mt-0.5 text-xs text-[#94A3B8]">
                Inject RC522 RFID taps, IR break-beam events, or servo faults to test live telemetry pipelines.
              </p>
            </div>

            {/* Simulator Step 1: RFID Tap */}
            <div className="space-y-2.5 rounded-lg border border-[#1F293D] bg-[#0B0F19]/60 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F8FAFC]">1. RC522 RFID Tag Tap</span>
                <span className="font-mono text-[11px] text-[#00F0FF]">13.56 MHz</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <select
                  value={selectedGateId}
                  onChange={(e) => setSelectedGateId(e.target.value)}
                  aria-label="Target gate"
                  className="input-obsidian rounded px-2.5 py-2 font-mono text-xs"
                >
                  {gates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.id}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedUid}
                  onChange={(e) => setSelectedUid(e.target.value)}
                  aria-label="RFID tag UID"
                  className="input-obsidian rounded px-2.5 py-2 font-mono text-xs"
                >
                  {credentials.map((c) => (
                    <option key={c.id} value={c.rfidUid}>
                      {c.rfidUid} ({c.plate})
                    </option>
                  ))}
                  <option value="FF:00:99:DE">FF:00:99:DE (UNREGISTERED)</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => onSimulateRfidTap(selectedGateId, selectedUid)}
                className="inline-flex w-full items-center justify-center gap-2 rounded border border-[#00F0FF]/50 bg-[#00F0FF]/10 px-3 py-2 text-xs font-medium text-[#00F0FF] hover:bg-[#00F0FF]/20"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Simulate RFID Tap</span>
              </button>
            </div>

            {/* Simulator Step 2: IR Break Beam */}
            <div className="space-y-2.5 rounded-lg border border-[#1F293D] bg-[#0B0F19]/60 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#F8FAFC]">2. IR Sensor Break-Beam</span>
                <span className="font-mono text-[11px] text-[#10B981]">GPIO LOW</span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={selectedBayId}
                  onChange={(e) => setSelectedBayId(e.target.value)}
                  aria-label="Target parking bay"
                  className="input-obsidian flex-1 rounded px-2.5 py-2 font-mono text-xs"
                >
                  {bays.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} ({b.status.toUpperCase()})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => selectedBayId && onSimulateIrBreak(selectedBayId)}
                  className="inline-flex items-center justify-center gap-1.5 rounded border border-[#1F293D] bg-[#111827] px-4 py-2 text-xs font-medium text-[#F8FAFC] hover:border-[#38BDF8] whitespace-nowrap"
                >
                  <Radio className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Trigger Beam</span>
                </button>
              </div>
            </div>
          </div>

          {/* Simulator Step 3: Fault Injection */}
          <div className="pt-2 border-t border-[#1F293D]">
            <button
              type="button"
              onClick={() => onSimulateServoTimeout(selectedGateId)}
              className="inline-flex w-full items-center justify-center gap-2 rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-4 py-2 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/20"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Inject Servo Timeout Diagnostic ({selectedGateId})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: ESP32 Microcontroller Telemetry Mesh */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#F8FAFC]">
              ESP32 Core &amp; IR Sensor Arrays
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Live Wi-Fi RSSI signal strength, packet cadence, and 8-channel GPIO digital pin states
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {nodes.map((node) => (
            <div key={node.id} className="glass-panel rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-[#00F0FF]" />
                    <span className="font-mono text-sm font-bold text-[#F8FAFC]">
                      {node.id}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    {node.name} · {node.firmware}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleNodeOnline(node.id)}
                  className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                    node.online
                      ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20'
                      : 'border-[#64748B]/50 bg-[#64748B]/15 text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  <RotateCw className="h-3 w-3" />
                  <span>{node.online ? 'ONLINE' : 'OFFLINE'}</span>
                </button>
              </div>

              {/* Technical Telemetry Badges */}
              <div className="grid grid-cols-3 gap-2.5 rounded-lg border border-[#1F293D] bg-[#0B0F19]/80 p-3 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-[#64748B]">WI-FI RSSI</div>
                  <div className="mt-1 flex items-center gap-1.5 tabular-nums text-[#F8FAFC]">
                    <Wifi className="h-3 w-3 text-[#00F0FF]" />
                    <span>{node.online ? `${node.rssiDbm} dBm` : 'N/A'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B]">PACKET RATE</div>
                  <div className="mt-1 tabular-nums text-[#F8FAFC]">
                    {node.online ? `${node.packetHz.toFixed(1)} Hz` : '0.0 Hz'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B]">IP BINDING</div>
                  <div className="mt-1 tabular-nums text-[#94A3B8] truncate">
                    {node.ipAddress}
                  </div>
                </div>
              </div>

              {/* 8-Channel IR Array Readout */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                  <span>IR Array Channels (CH0–CH7)</span>
                  <span className="font-mono text-[#64748B]">MAC {node.macAddress}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                  {node.irChannels.map((state, idx) => (
                    <div
                      key={idx}
                      className={`rounded border px-1.5 py-1.5 text-center font-mono text-[10px] ${
                        !node.online
                          ? 'border-[#1F293D] bg-[#0B0F19] text-[#64748B]'
                          : state === 'LOW'
                          ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
                          : 'border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]'
                      }`}
                    >
                      <div className="text-[9px] text-[#64748B]">CH{idx}</div>
                      <div className="font-semibold">{node.online ? state : '--'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
