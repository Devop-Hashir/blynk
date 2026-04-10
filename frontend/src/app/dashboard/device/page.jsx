"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, getUserId } from "@/app/lib/api";
import { useSocket } from "@/app/hooks/useSocket";
import Navbar from "../components/Navbar";
import Toggle from "../components/Toggle";
import ErrorBar from "../components/ErrorBar";
import { inp, lbl } from "../styles/common";

const ICONS = {
  light: "💡",
  fan: "🌀",
  ac: "❄️",
  tv: "📺",
  plug: "🔌",
  door: "🚪",
  other: "⚙️",
};

// Pin numbers 1-4 map to ESP32 relays
// 1 → GPIO2 (Relay1), 2 → GPIO4 (Relay2), 3 → GPIO5 (Relay3), 4 → GPIO18 (Relay4)
const ALL_PINS = ["1", "2", "3", "4"];

function DevicePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("id") || "";

  const [userId, setUserId] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinForm, setPinForm] = useState({ pinNumber: "1", label: "" });
  const [showPinModal, setShowPinModal] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const { socket, connected, controlPin, isDeviceOnline } = useSocket(userId);
  useEffect(() => {
    setUserId(getUserId());
  }, []);

  const loadDevice = useCallback(async () => {
    if (!deviceId) return;
    try {
      const all = await api.getDevices();
      const found = all.find((d) => d.deviceId === deviceId);
      if (!found) {
        router.push("/dashboard");
        return;
      }
      setDevice(found);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [deviceId, router]);

  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  useEffect(() => {
    if (deviceId) setIsOnline(isDeviceOnline(deviceId));
  }, [deviceId, isDeviceOnline]);

  useEffect(() => {
    if (!socket || !device) return;

    const onStatus = ({ deviceId: dId, pin, state }) => {
      if (dId !== deviceId) return;
      setDevice((prev) => ({
        ...prev,
        pins: prev.pins.map((p) => (p.pinNumber === pin ? { ...p, state } : p)),
      }));
    };
    const onOnline = ({ deviceId: dId }) => {
      if (dId === deviceId) setIsOnline(true);
    };
    const onOffline = ({ deviceId: dId }) => {
      if (dId === deviceId) setIsOnline(false);
    };
    const onOnlineDevices = ({ deviceIds }) => {
      setIsOnline(deviceIds.includes(deviceId));
    };

    socket.on("status_update", onStatus);
    socket.on("device_online", onOnline);
    socket.on("device_offline", onOffline);
    socket.on("online_devices", onOnlineDevices);

    return () => {
      socket.off("status_update", onStatus);
      socket.off("device_online", onOnline);
      socket.off("device_offline", onOffline);
      socket.off("online_devices", onOnlineDevices);
    };
  }, [socket, device, deviceId]);

  const handleToggle = async (pin) => {
    const newState = pin.state === "ON" ? "OFF" : "ON";
    setDevice((prev) => ({
      ...prev,
      pins: prev.pins.map((p) =>
        p.pinNumber === pin.pinNumber ? { ...p, state: newState } : p,
      ),
    }));
    controlPin(deviceId, pin.pinNumber, newState);
    try {
      await api.controlPin({ deviceId, pin: pin.pinNumber, state: newState });
    } catch {}
  };

  const handleAddPin = async () => {
    if (!pinForm.label.trim()) return;
    try {
      await api.addPin(deviceId, {
        pinNumber: pinForm.pinNumber,
        label: pinForm.label,
      });
      await loadDevice();
      setShowPinModal(false);
      setPinForm({ pinNumber: "1", label: "" });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRemovePin = async (pinNumber) => {
    try {
      await api.removePin(deviceId, pinNumber);
      setDevice((prev) => ({
        ...prev,
        pins: prev.pins.filter((p) => p.pinNumber !== pinNumber),
      }));
    } catch (e) {
      setError(e.message);
    }
  };

  if (!deviceId) {
    router.push("/dashboard");
    return null;
  }
  if (loading)
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "#888" }}>
        Loading...
      </div>
    );
  if (!device) return null;

  const usedPins = device.pins.map((p) => String(p.pinNumber));
  const availablePins = ALL_PINS.filter((p) => !usedPins.includes(p));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f0f0",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <Navbar connected={connected} />

      <div
        style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "28px",
            fontSize: "13px",
          }}
        >
          <Link
            href="/dashboard"
            style={{ color: "#4fa3e3", textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <span style={{ color: "#ccc" }}>/</span>
          <Link
            href={`/dashboard/room?name=${encodeURIComponent(device.room || "General")}`}
            style={{ color: "#4fa3e3", textDecoration: "none" }}
          >
            {device.room || "General"}
          </Link>
          <span style={{ color: "#ccc" }}>/</span>
          <span style={{ color: "#888" }}>{device.name}</span>
        </div>

        {error && <ErrorBar msg={error} onClose={() => setError("")} />}

        {/* Device header */}
        <div
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "24px",
            marginBottom: "24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                background: "#f5f5f5",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              {ICONS[device.type] || "⚙️"}
            </div>
            <div style={{ flex: 1 }}>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  color: "#111",
                  margin: "0 0 4px",
                }}
              >
                {device.name}
              </h1>
              <div style={{ fontSize: "13px", color: "#888" }}>
                {device.room} · {device.deviceId}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isOnline ? "#22c55e" : "#d1d5db",
                }}
              />
              <span style={{ fontSize: "12px", color: "#888" }}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* ESP32 hint */}
        <div
          style={{
            background: "#111",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#3F8F3A",
              marginBottom: "8px",
              letterSpacing: "0.08em",
            }}
          >
            ESP32 SKETCH — USE THIS DEVICE ID
          </div>
          <code
            style={{
              fontSize: "13px",
              color: "#e5e7eb",
              fontFamily: "monospace",
            }}
          >
            {`const char* DEVICE_ID = "${device.deviceId}";`}
          </code>
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              marginTop: "12px",
              lineHeight: 1.8,
            }}
          >
            Pin numbers: <span style={{ color: "#3F8F3A" }}>1</span> → GPIO2
            &nbsp;
            <span style={{ color: "#3F8F3A" }}>2</span> → GPIO4 &nbsp;
            <span style={{ color: "#3F8F3A" }}>3</span> → GPIO5 &nbsp;
            <span style={{ color: "#3F8F3A" }}>4</span> → GPIO18
          </div>
        </div>

        {/* Pins section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#111",
              margin: 0,
            }}
          >
            Pins{" "}
            <span style={{ color: "#888", fontWeight: 400, fontSize: "13px" }}>
              ({device.pins.length}/4)
            </span>
          </h2>
          {availablePins.length > 0 && (
            <button
              onClick={() => {
                setPinForm({ pinNumber: availablePins[0], label: "" });
                setShowPinModal(true);
              }}
              style={{
                background: "#3F8F3A",
                border: "none",
                borderRadius: "6px",
                padding: "7px 14px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                color: "white",
              }}
            >
              + Add Pin
            </button>
          )}
        </div>

        {device.pins.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔌</div>
            <p style={{ color: "#888", fontSize: "14px", margin: "0 0 4px" }}>
              No pins yet.
            </p>
            <p style={{ color: "#bbb", fontSize: "12px", margin: "0 0 20px" }}>
              Add pins 1–4. Each maps to a relay on the ESP32.
            </p>
            <button
              onClick={() => {
                setPinForm({ pinNumber: "1", label: "" });
                setShowPinModal(true);
              }}
              style={{
                background: "#3F8F3A",
                border: "none",
                borderRadius: "6px",
                padding: "8px 20px",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                color: "white",
              }}
            >
              + Add Pin
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {device.pins.map((pin) => (
              <PinCard
                key={pin.pinNumber}
                pin={pin}
                onToggle={() => handleToggle(pin)}
                onRemove={() => handleRemovePin(pin.pinNumber)}
              />
            ))}
          </div>
        )}
      </div>

      {showPinModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "32px",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "18px",
                fontWeight: "700",
                color: "#111",
              }}
            >
              Add Pin
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#888" }}>
              Pin 1 = Relay 1 (GPIO2), Pin 2 = Relay 2 (GPIO4), etc.
            </p>

            <label style={lbl}>Pin Number (1–4)</label>
            <select
              value={pinForm.pinNumber}
              onChange={(e) =>
                setPinForm((f) => ({ ...f, pinNumber: e.target.value }))
              }
              style={inp}
            >
              {availablePins.map((p) => (
                <option key={p} value={p}>
                  Pin {p}
                </option>
              ))}
            </select>

            <label style={lbl}>Label</label>
            <input
              value={pinForm.label}
              onChange={(e) =>
                setPinForm((f) => ({ ...f, label: e.target.value }))
              }
              placeholder="e.g. Ceiling Light"
              style={inp}
              autoFocus
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowPinModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "1.5px solid #e0e0e0",
                  borderRadius: "8px",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#555",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPin}
                disabled={!pinForm.label.trim()}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "8px",
                  background: pinForm.label.trim() ? "#3F8F3A" : "gray",
                  cursor: pinForm.label.trim() ? "pointer" : "not-allowed",
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                Add Pin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PinCard({ pin, onToggle, onRemove }) {
  const on = pin.state === "ON";

  const GPIO_MAP = { 1: "GPIO2", 2: "GPIO4", 3: "GPIO5", 4: "GPIO18" };

  return (
    <div
      style={{
        background: on ? "#111" : "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        border: on ? "2px solid #3F8F3A" : "2px solid transparent",
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: "700",
              fontSize: "14px",
              color: on ? "#fff" : "#111",
            }}
          >
            {pin.label}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: on ? "#666" : "#bbb",
              marginTop: "2px",
            }}
          >
            Pin {pin.pinNumber} · {GPIO_MAP[String(pin.pinNumber)] || ""}
          </div>
        </div>
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            opacity: 0.4,
            padding: "2px",
          }}
        >
          🗑️
        </button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: on ? "white" : "#aaa",
          }}
        >
          {pin.state}
        </span>
        <Toggle on={on} onToggle={onToggle} />
      </div>
    </div>
  );
}

export default function DevicePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "60px", textAlign: "center", color: "#888" }}>
          Loading...
        </div>
      }
    >
      <DevicePageInner />
    </Suspense>
  );
}
