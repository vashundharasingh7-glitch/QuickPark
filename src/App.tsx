import { useEffect, useMemo, useState } from 'react';
import { AccessLogsScreen } from './components/AccessLogsScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { BayFloorplanScreen } from './components/BayFloorplanScreen';
import { BayInspectorDrawer } from './components/BayInspectorDrawer';
import { HardwareTelemetryScreen } from './components/HardwareTelemetryScreen';
import { KpiStrip } from './components/KpiStrip';
import { ReservationModal } from './components/ReservationModal';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import {
  INITIAL_BAYS,
  INITIAL_CREDENTIALS,
  INITIAL_EVENTS,
  INITIAL_GATES,
  INITIAL_NODES,
} from './data/initialTelemetry';
import {
  AccessEvent,
  ActiveScreen,
  BayStatus,
  Esp32Node,
  EventCategory,
  FleetCredential,
  GateBarrier,
  ParkingBay,
  ZoneId,
} from './types/telemetry';

function nowTimeStr(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('cockpit');
  const [bays, setBays] = useState<ParkingBay[]>(INITIAL_BAYS);
  const [gates, setGates] = useState<GateBarrier[]>(INITIAL_GATES);
  const [nodes, setNodes] = useState<Esp32Node[]>(INITIAL_NODES);
  const [events, setEvents] = useState<AccessEvent[]>(INITIAL_EVENTS);
  const [credentials, setCredentials] = useState<FleetCredential[]>(INITIAL_CREDENTIALS);

  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);
  const [zoneFilter, setZoneFilter] = useState<ZoneId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<BayStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveStreamActive, setLiveStreamActive] = useState(true);

  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reservePreselectBayId, setReservePreselectBayId] = useState<string | null>(null);

  const appendEvent = (
    category: EventCategory,
    detail: string,
    outcome: AccessEvent['outcome'],
    extra?: Partial<AccessEvent>
  ) => {
    const newEvt: AccessEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: nowTimeStr(),
      category,
      detail,
      outcome,
      ...extra,
    };
    setEvents((prev) => [newEvt, ...prev].slice(0, 80));
  };

  // Live 1-second telemetry & countdown ticker
  useEffect(() => {
    if (!liveStreamActive) return;

    const timer = window.setInterval(() => {
      const ts = nowTimeStr();

      setBays((prevBays) =>
        prevBays.map((bay) => {
          if (bay.status === 'reserved' && bay.reservedSecondsLeft !== undefined) {
            const nextSec = bay.reservedSecondsLeft - 1;
            if (nextSec <= 0) {
              return {
                ...bay,
                status: 'available',
                irState: 'HIGH',
                irDistanceCm: 215,
                plate: undefined,
                rfidUid: undefined,
                driverName: undefined,
                reservedSecondsLeft: undefined,
                lastUpdated: ts,
              };
            }
            return { ...bay, reservedSecondsLeft: nextSec };
          }
          return bay;
        })
      );

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (!node.online) return node;
          const jitter = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const nextRssi = Math.max(-72, Math.min(-42, node.rssiDbm + jitter));
          return {
            ...node,
            rssiDbm: nextRssi,
            lastPacketAt: ts,
          };
        })
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [liveStreamActive]);

  // Keep ESP32 IR channel matrix synced with live bay IR states
  const syncedNodes = useMemo(() => {
    return nodes.map((node) => {
      const zoneBays = bays.filter((b) => b.zoneId === node.zoneId);
      if (zoneBays.length === 8) {
        return {
          ...node,
          irChannels: zoneBays.map((b) => b.irState),
        };
      }
      return node;
    });
  }, [nodes, bays]);

  const selectedBay = useMemo(
    () => bays.find((b) => b.id === selectedBayId) ?? null,
    [bays, selectedBayId]
  );

  const availableCount = bays.filter((b) => b.status === 'available').length;
  const onlineNodesCount = syncedNodes.filter((n) => n.online).length;
  const anyGateLocked = gates.some((g) => g.locked);

  // Handlers
  const handleToggleGate = (gateId: string) => {
    const target = gates.find((g) => g.id === gateId);
    if (!target || target.locked) return;
    const nextOpen = target.angle <= 10;
    const nextAngle = nextOpen ? 90 : 0;

    setGates((prev) =>
      prev.map((g) =>
        g.id === gateId
          ? {
              ...g,
              angle: nextAngle,
              lastAuthResult: 'MANUAL',
              cyclesToday: nextOpen ? g.cyclesToday + 1 : g.cyclesToday,
            }
          : g
      )
    );

    appendEvent(
      'GATE_OVERRIDE',
      `Operator manually ${nextOpen ? 'opened' : 'closed'} ${target.id} (${target.servoModel} rotated to ${nextAngle}°).`,
      'nominal',
      { gateId }
    );
  };

  const handleToggleGateLock = (gateId: string) => {
    const target = gates.find((g) => g.id === gateId);
    if (!target) return;
    const nextLocked = !target.locked;

    setGates((prev) =>
      prev.map((g) =>
        g.id === gateId
          ? {
              ...g,
              locked: nextLocked,
              angle: nextLocked ? 0 : g.angle,
            }
          : g
      )
    );

    appendEvent(
      'GATE_OVERRIDE',
      nextLocked
        ? `Emergency halt lock engaged on ${gateId}; barrier forced to 0° CLOSED.`
        : `Emergency halt lock released on ${gateId}; normal RFID servo control restored.`,
      nextLocked ? 'critical' : 'nominal',
      { gateId }
    );
  };

  const handleConfirmReservation = ({
    bayId,
    plate,
    driverName,
    rfidUid,
    durationMinutes,
  }: {
    bayId: string;
    plate: string;
    driverName: string;
    rfidUid: string;
    durationMinutes: number;
  }) => {
    const ts = nowTimeStr();
    const target = bays.find((b) => b.id === bayId);
    if (!target) return;

    setBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              status: 'reserved',
              irState: 'HIGH',
              irDistanceCm: 212,
              plate,
              driverName,
              rfidUid,
              reservedSecondsLeft: durationMinutes * 60,
              occupiedSince: undefined,
              lastUpdated: ts,
            }
          : b
      )
    );

    appendEvent(
      'RFID_TAP',
      `Bay ${target.code} reserved for ${plate} (${durationMinutes}m hold window).`,
      'nominal',
      { bayCode: target.code, plate, rfidUid }
    );
  };

  const handleSimulateEntry = (bayId: string) => {
    const ts = nowTimeStr();
    const target = bays.find((b) => b.id === bayId);
    if (!target) return;

    const assignedPlate = target.plate ?? `EV-${Math.floor(100 + Math.random() * 899)}-TX`;
    const assignedDriver = target.driverName ?? 'Fleet Transit Vehicle';
    const assignedUid = target.rfidUid ?? '04:6B:19:E2';

    setBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              status: 'occupied',
              irState: 'LOW',
              irDistanceCm: 17,
              plate: assignedPlate,
              driverName: assignedDriver,
              rfidUid: assignedUid,
              reservedSecondsLeft: undefined,
              occupiedSince: ts,
              lastUpdated: ts,
            }
          : b
      )
    );

    appendEvent(
      'IR_BREAK_BEAM',
      `IR beam interrupted (17 cm echo) on GPIO ${target.gpioPin}. Bay ${target.code} occupied by ${assignedPlate}.`,
      'nominal',
      { bayCode: target.code, plate: assignedPlate, rfidUid: assignedUid }
    );
  };

  const handleSimulateExit = (bayId: string) => {
    const ts = nowTimeStr();
    const target = bays.find((b) => b.id === bayId);
    if (!target) return;
    const departingPlate = target.plate;

    setBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              status: 'available',
              irState: 'HIGH',
              irDistanceCm: 216,
              plate: undefined,
              driverName: undefined,
              rfidUid: undefined,
              occupiedSince: undefined,
              reservedSecondsLeft: undefined,
              lastUpdated: ts,
            }
          : b
      )
    );

    appendEvent(
      'IR_BREAK_BEAM',
      `IR beam restored (216 cm clear) on Bay ${target.code}. Vehicle ${departingPlate ?? ''} departed.`,
      'nominal',
      { bayCode: target.code, plate: departingPlate }
    );
  };

  const handleClearHold = (bayId: string) => {
    const ts = nowTimeStr();
    const target = bays.find((b) => b.id === bayId);
    if (!target) return;

    setBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              status: 'available',
              irState: 'HIGH',
              irDistanceCm: 215,
              plate: undefined,
              driverName: undefined,
              rfidUid: undefined,
              reservedSecondsLeft: undefined,
              lastUpdated: ts,
            }
          : b
      )
    );

    appendEvent(
      'GATE_OVERRIDE',
      `Reservation hold cleared on Bay ${target.code}; slot returned to available pool.`,
      'nominal',
      { bayCode: target.code, plate: target.plate }
    );
  };

  const handleToggleOffline = (bayId: string) => {
    const ts = nowTimeStr();
    const target = bays.find((b) => b.id === bayId);
    if (!target) return;

    const goingOffline = target.status !== 'offline';
    setBays((prev) =>
      prev.map((b) =>
        b.id === bayId
          ? {
              ...b,
              status: goingOffline ? 'offline' : 'available',
              irState: 'HIGH',
              irDistanceCm: goingOffline ? 0 : 215,
              plate: goingOffline ? undefined : b.plate,
              driverName: goingOffline ? undefined : b.driverName,
              rfidUid: goingOffline ? undefined : b.rfidUid,
              reservedSecondsLeft: undefined,
              occupiedSince: undefined,
              lastUpdated: ts,
            }
          : b
      )
    );

    appendEvent(
      'SERVO_TIMEOUT',
      goingOffline
        ? `Bay ${target.code} flagged diagnostic offline on ${target.nodeId} (GPIO ${target.gpioPin}).`
        : `Bay ${target.code} sensor calibration restored online.`,
      goingOffline ? 'warning' : 'nominal',
      { bayCode: target.code }
    );
  };

  const handleSimulateRfidTap = (gateId: string, uid: string) => {
    const matchedCred = credentials.find(
      (c) => c.rfidUid.toUpperCase() === uid.toUpperCase() && c.active
    );
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return;

    if (gate.locked) {
      appendEvent(
        'RFID_TAP',
        `RFID UID ${uid} scanned at ${gateId}, but barrier is locked by Emergency Halt.`,
        'critical',
        { gateId, rfidUid: uid, plate: matchedCred?.plate }
      );
      return;
    }

    if (matchedCred) {
      setGates((prev) =>
        prev.map((g) =>
          g.id === gateId
            ? {
                ...g,
                angle: 90,
                lastScannedUid: uid,
                lastAuthResult: 'GRANTED',
                cyclesToday: g.cyclesToday + 1,
              }
            : g
        )
      );
      setCredentials((prev) =>
        prev.map((c) =>
          c.id === matchedCred.id ? { ...c, lastSeen: nowTimeStr() } : c
        )
      );
      appendEvent(
        'RFID_TAP',
        `RC522 verified UID ${uid} (${matchedCred.plate}). ${gateId} ${gate.servoModel} rotated to 90° OPEN.`,
        'nominal',
        { gateId, rfidUid: uid, plate: matchedCred.plate }
      );
    } else {
      setGates((prev) =>
        prev.map((g) =>
          g.id === gateId
            ? {
                ...g,
                angle: 0,
                lastScannedUid: uid,
                lastAuthResult: 'DENIED',
              }
            : g
        )
      );
      appendEvent(
        'RFID_TAP',
        `Unregistered or revoked RFID UID ${uid} denied at ${gateId}; barrier held at 0° CLOSED.`,
        'warning',
        { gateId, rfidUid: uid }
      );
    }
  };

  const handleSimulateServoTimeout = (gateId: string) => {
    appendEvent(
      'SERVO_TIMEOUT',
      `PWM feedback timeout detected on ${gateId} actuator; auto-rehomed to 0° safety stop.`,
      'warning',
      { gateId }
    );
  };

  const handleToggleNodeOnline = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, online: !n.online } : n))
    );
  };

  const handleAddCredential = (
    cred: Omit<FleetCredential, 'id' | 'active' | 'lastSeen'>
  ) => {
    const newCred: FleetCredential = {
      ...cred,
      id: `cred-${Date.now()}`,
      active: true,
      lastSeen: nowTimeStr(),
    };
    setCredentials((prev) => [newCred, ...prev]);
    appendEvent(
      'RFID_TAP',
      `Registered new fleet credential ${newCred.plate} (UID ${newCred.rfidUid}) under ${newCred.clearanceTier}.`,
      'nominal',
      { plate: newCred.plate, rfidUid: newCred.rfidUid }
    );
  };

  const handleToggleCredentialActive = (credId: string) => {
    setCredentials((prev) =>
      prev.map((c) => (c.id === credId ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F8FAFC] flex">
      {/* Left Navigation Sidebar + Mobile Bottom Dock */}
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        availableCount={availableCount}
        totalCount={bays.length}
        onlineNodesCount={onlineNodesCount}
        totalNodesCount={syncedNodes.length}
        gateLocked={anyGateLocked}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <TopBar
          activeScreen={activeScreen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          liveStreamActive={liveStreamActive}
          onToggleLiveStream={() => setLiveStreamActive((v) => !v)}
          onOpenReserveModal={() => {
            setReservePreselectBayId(null);
            setReserveModalOpen(true);
          }}
        />

        <main className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-5 sm:px-6 lg:px-8 space-y-6">
          {/* Persistent Operational KPI Strip */}
          <KpiStrip bays={bays} gates={gates} />

          {/* Active Screen Router */}
          {activeScreen === 'cockpit' && (
            <BayFloorplanScreen
              bays={bays}
              gates={gates}
              recentEvents={events}
              selectedBayId={selectedBayId}
              onSelectBay={(id) => setSelectedBayId(id)}
              zoneFilter={zoneFilter}
              onZoneFilterChange={setZoneFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleGate={handleToggleGate}
              onNavigateScreen={setActiveScreen}
            />
          )}

          {activeScreen === 'hardware' && (
            <HardwareTelemetryScreen
              gates={gates}
              nodes={syncedNodes}
              bays={bays}
              credentials={credentials}
              onToggleGate={handleToggleGate}
              onToggleGateLock={handleToggleGateLock}
              onSimulateRfidTap={handleSimulateRfidTap}
              onSimulateIrBreak={handleSimulateEntry}
              onSimulateServoTimeout={handleSimulateServoTimeout}
              onToggleNodeOnline={handleToggleNodeOnline}
            />
          )}

          {activeScreen === 'logs' && (
            <AccessLogsScreen
              events={events}
              credentials={credentials}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onAddCredential={handleAddCredential}
              onToggleCredentialActive={handleToggleCredentialActive}
            />
          )}

          {activeScreen === 'analytics' && (
            <AnalyticsScreen bays={bays} gates={gates} />
          )}
        </main>
      </div>

      {/* Bay Telemetry Inspector Drawer */}
      <BayInspectorDrawer
        bay={selectedBay}
        onClose={() => setSelectedBayId(null)}
        onReserveBay={(bayId) => {
          setSelectedBayId(null);
          setReservePreselectBayId(bayId);
          setReserveModalOpen(true);
        }}
        onSimulateEntry={handleSimulateEntry}
        onSimulateExit={handleSimulateExit}
        onClearHold={handleClearHold}
        onToggleOffline={handleToggleOffline}
      />

      {/* Reservation Assignment Modal */}
      <ReservationModal
        isOpen={reserveModalOpen}
        bays={bays}
        initialBayId={reservePreselectBayId}
        onClose={() => setReserveModalOpen(false)}
        onConfirmReservation={handleConfirmReservation}
      />
    </div>
  );
}
