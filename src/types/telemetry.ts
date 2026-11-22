export type BayStatus = 'available' | 'occupied' | 'reserved' | 'offline';

export type ZoneId = 'zone-a' | 'zone-b' | 'zone-c';

export type ActiveScreen = 'cockpit' | 'hardware' | 'logs' | 'analytics';

export type EventCategory =
  | 'RFID_TAP'
  | 'IR_BREAK_BEAM'
  | 'SERVO_TIMEOUT'
  | 'GATE_OVERRIDE';

export interface ParkingBay {
  id: string;
  code: string;
  zoneId: ZoneId;
  zoneLabel: string;
  status: BayStatus;
  irState: 'HIGH' | 'LOW';
  irDistanceCm: number;
  nodeId: string;
  gpioPin: number;
  evChargerKw?: number;
  plate?: string;
  rfidUid?: string;
  driverName?: string;
  reservedSecondsLeft?: number;
  occupiedSince?: string;
  lastUpdated: string;
}

export interface GateBarrier {
  id: string;
  name: string;
  direction: 'ENTRY' | 'EXIT';
  servoModel: 'SG90' | 'MG996R';
  angle: number; // 0 = CLOSED, 90 = OPEN
  locked: boolean;
  rfidReaderStatus: 'READY' | 'SCANNING' | 'FAULT';
  lastScannedUid: string;
  lastAuthResult: 'GRANTED' | 'DENIED' | 'MANUAL';
  cyclesToday: number;
}

export interface Esp32Node {
  id: string;
  name: string;
  zoneId: ZoneId;
  ipAddress: string;
  macAddress: string;
  rssiDbm: number;
  packetHz: number;
  uptimeHours: number;
  firmware: string;
  online: boolean;
  irChannels: ('HIGH' | 'LOW')[];
  lastPacketAt: string;
}

export interface AccessEvent {
  id: string;
  timestamp: string;
  category: EventCategory;
  bayCode?: string;
  gateId?: string;
  plate?: string;
  rfidUid?: string;
  detail: string;
  outcome: 'nominal' | 'warning' | 'critical';
}

export interface FleetCredential {
  id: string;
  plate: string;
  rfidUid: string;
  driverName: string;
  fleetUnit: string;
  clearanceTier: 'Executive EV' | 'Fleet Rapid' | 'Contractor';
  active: boolean;
  lastSeen: string;
}

export interface HourlyUtilization {
  hour: string;
  occupancyPct: number;
  entries: number;
  evLoadKw: number;
}
