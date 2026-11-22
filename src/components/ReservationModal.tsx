import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { ParkingBay } from '../types/telemetry';

interface ReservationModalProps {
  isOpen: boolean;
  bays: ParkingBay[];
  initialBayId?: string | null;
  onClose: () => void;
  onConfirmReservation: (payload: {
    bayId: string;
    plate: string;
    driverName: string;
    rfidUid: string;
    durationMinutes: number;
  }) => void;
}

export function ReservationModal({
  isOpen,
  bays,
  initialBayId,
  onClose,
  onConfirmReservation,
}: ReservationModalProps) {
  const availableBays = bays.filter((b) => b.status === 'available');
  const [bayId, setBayId] = useState<string>('');
  const [plate, setPlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [rfidUid, setRfidUid] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);

  useEffect(() => {
    if (isOpen) {
      if (initialBayId && availableBays.some((b) => b.id === initialBayId)) {
        setBayId(initialBayId);
      } else if (availableBays[0]) {
        setBayId(availableBays[0].id);
      } else {
        setBayId('');
      }
      setPlate('');
      setDriverName('');
      setRfidUid('');
      setDurationMinutes(30);
    }
  }, [isOpen, initialBayId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bayId || !plate.trim()) return;
    onConfirmReservation({
      bayId,
      plate: plate.trim().toUpperCase(),
      driverName: driverName.trim() || 'Enterprise Driver',
      rfidUid: rfidUid.trim().toUpperCase() || '04:8F:3A:11',
      durationMinutes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-label="Reserve Parking Bay"
        className="glass-overlay w-full max-w-md rounded-xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[#334155] pb-3.5">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#F8FAFC]">
              Reserve Parking Bay
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Assign ALPR license plate and RFID hold clearance
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reservation modal"
            className="rounded border border-[#334155] bg-[#0B0F19] p-1.5 text-[#94A3B8] hover:border-[#00F0FF] hover:text-[#F8FAFC]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {availableBays.length === 0 ? (
          <div className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 p-4 text-xs text-[#EF4444]">
            All parking bays are currently occupied, reserved, or offline. Release an existing hold before creating a new reservation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="res-bay" className="block text-xs font-medium text-[#CBD5E1]">
                Target Available Bay
              </label>
              <select
                id="res-bay"
                value={bayId}
                onChange={(e) => setBayId(e.target.value)}
                className="input-obsidian w-full rounded px-3 py-2 font-mono text-xs"
              >
                {availableBays.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.zoneLabel}
                    {b.evChargerKw ? ` (${b.evChargerKw} kW EV)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="res-plate" className="block text-xs font-medium text-[#CBD5E1]">
                Vehicle License Plate (ALPR)
              </label>
              <input
                id="res-plate"
                type="text"
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="E.G. CA-940-EV"
                className="input-obsidian w-full rounded px-3 py-2 font-mono text-xs uppercase tracking-wider"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="res-driver" className="block text-xs font-medium text-[#CBD5E1]">
                  Driver / Unit
                </label>
                <input
                  id="res-driver"
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Optional name"
                  className="input-obsidian w-full rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="res-uid" className="block text-xs font-medium text-[#CBD5E1]">
                  RFID UID Tag
                </label>
                <input
                  id="res-uid"
                  type="text"
                  value={rfidUid}
                  onChange={(e) => setRfidUid(e.target.value.toUpperCase())}
                  placeholder="04:8F:3A:11"
                  className="input-obsidian w-full rounded px-3 py-2 font-mono text-xs uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#CBD5E1]">
                <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span>Hold Window</span>
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`rounded border py-2 font-mono text-xs font-medium transition-colors ${
                      durationMinutes === mins
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]'
                        : 'border-[#334155] bg-[#0B0F19] text-[#94A3B8] hover:text-[#F8FAFC]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 border-t border-[#334155] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-[#334155] bg-[#111827] px-4 py-2 text-xs font-medium text-[#CBD5E1] hover:border-[#38BDF8]"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary-cyan rounded px-5 py-2 text-xs">
                Confirm Reservation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
