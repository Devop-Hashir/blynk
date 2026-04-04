"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, getUserId, getUserEmail } from "@/app/lib/api";
import { useSocket } from "@/app/hooks/useSocket";
import Navbar from "./components/Navbar";
import ErrorBar from "./components/ErrorBar";
import LogoutModal from "./components/LogoutModal";
import DeleteModal from "./components/DeleteModel";
import { inp, lbl, btnPrimary } from "./styles/common";

const ROOM_ICONS = ["🏠", "🛋️", "🛏️", "🍳", "🚿", "🏢", "🌿", "🎮", "📚", "🏋️"];

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: "", icon: "🏠" });
  const [editRoom, setEditRoom] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const { connected } = useSocket(userId);

  useEffect(() => {
    setUserId(getUserId());
    setUserEmail(getUserEmail());
  }, []);

  const load = useCallback(async () => {
    try {
      const [r, d] = await Promise.all([api.getRooms(), api.getDevices()]);
      setRooms(r);
      setDevices(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveRoom = async () => {
    if (!roomForm.name.trim()) return;
    try {
      if (editRoom) {
        await api.updateRoom(editRoom._id, roomForm);
      } else {
        await api.addRoom(roomForm);
      }
      await load();
      setShowRoomModal(false);
      setEditRoom(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteRoom(deleteTarget.id);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const openAddRoom = () => {
    setRoomForm({ name: "", icon: "🏠" });
    setEditRoom(null);
    setShowRoomModal(true);
  };
  const openEditRoom = (r) => {
    setRoomForm({ name: r.name, icon: r.icon });
    setEditRoom(r);
    setShowRoomModal(true);
  };
  const handleLogout = () => {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/auth/login");
  };

  const totalActive = devices.reduce(
    (a, d) => a + d.pins.filter((p) => p.state === "ON").length,
    0,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f0f0",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <Navbar
        userEmail={userEmail}
        connected={connected}
        onLogout={() => setShowLogout(true)}
        showVoice
      />

      <div
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}
      >
        {error && <ErrorBar msg={error} onClose={() => setError("")} />}

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#111",
                margin: 0,
              }}
            >
              My Home
            </h1>
            <p style={{ fontSize: "13px", color: "#888", margin: "4px 0 0" }}>
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} ·{" "}
              {devices.length} device{devices.length !== 1 ? "s" : ""} ·{" "}
              {totalActive} active
            </p>
          </div>
          <button onClick={openAddRoom} style={btnPrimary}>
            + Add Room
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {[
            ["🚪", "Rooms", rooms.length],
            ["🏠", "Devices", devices.length],
            ["✅", "Active", totalActive],
          ].map(([icon, label, val]) => (
            <div
              key={label}
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "20px 24px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                {icon}
              </div>
              <div
                style={{ fontSize: "28px", fontWeight: "700", color: "#111" }}
              >
                {val}
              </div>
              <div
                style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
            Loading...
          </div>
        )}

        {/* Empty state */}
        {!loading && rooms.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "64px 24px",
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🏠</div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#111",
                margin: "0 0 8px",
              }}
            >
              Start by creating a room
            </h2>
            <p style={{ fontSize: "14px", color: "#888", margin: "0 0 28px" }}>
              Rooms help you organise devices — Living Room, Bedroom, Kitchen,
              etc.
            </p>
            <button onClick={openAddRoom} style={btnPrimary}>
              + Create your first room
            </button>
          </div>
        )}

        {/* Room grid */}
        {!loading && rooms.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: "20px",
            }}
          >
            {rooms.map((room) => {
              const roomDevices = devices.filter((d) => d.room === room.name);
              const activeInRoom = roomDevices.reduce(
                (a, d) => a + d.pins.filter((p) => p.state === "ON").length,
                0,
              );
              return (
                <RoomCard
                  key={room._id}
                  room={room}
                  deviceCount={roomDevices.length}
                  activeCount={activeInRoom}
                  onOpen={() =>
                    router.push(
                      `/dashboard/room?name=${encodeURIComponent(room.name)}`,
                    )
                  }
                  onEdit={() => openEditRoom(room)}
                  onDelete={() =>
                    setDeleteTarget({ id: room._id, name: room.name })
                  }
                />
              );
            })}
            <div
              onClick={openAddRoom}
              style={{
                background: "#fff",
                borderRadius: "14px",
                padding: "32px 20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #e0e0e0",
                gap: "10px",
                minHeight: "160px",
              }}
            >
              <div style={{ fontSize: "28px", color: "#ccc" }}>+</div>
              <div
                style={{ fontSize: "13px", fontWeight: "600", color: "#aaa" }}
              >
                Add Room
              </div>
            </div>
          </div>
        )}
      </div>

      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={handleDeleteRoom}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showRoomModal && (
        <RoomModal
          form={roomForm}
          setForm={setRoomForm}
          onSave={handleSaveRoom}
          onClose={() => {
            setShowRoomModal(false);
            setEditRoom(null);
          }}
          isEdit={!!editRoom}
        />
      )}
    </div>
  );
}

function RoomCard({
  room,
  deviceCount,
  activeCount,
  onOpen,
  onEdit,
  onDelete,
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "24px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          display: "flex",
          gap: "4px",
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            opacity: 0.4,
            padding: "4px",
          }}
        >
          ✏️
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
            opacity: 0.4,
            padding: "4px",
          }}
        >
          🗑️
        </button>
      </div>
      <div onClick={onOpen}>
        <div style={{ fontSize: "40px", marginBottom: "14px" }}>
          {room.icon}
        </div>
        <div
          style={{
            fontWeight: "700",
            fontSize: "17px",
            color: "#111",
            marginBottom: "6px",
          }}
        >
          {room.name}
        </div>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "16px" }}>
          {deviceCount} device{deviceCount !== 1 ? "s" : ""} · {activeCount}{" "}
          active
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "20px",
            background: activeCount > 0 ? "#d4f532" : "#f0f0f0",
            fontSize: "11px",
            fontWeight: "700",
            color: "#111",
          }}
        >
          {activeCount > 0 ? `${activeCount} ON` : "All off"}
        </div>
      </div>
    </div>
  );
}

function RoomModal({ form, setForm, onSave, onClose, isEdit }) {
  const canSave = form.name.trim();
  return (
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
          maxWidth: "400px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <h2
          style={{
            margin: "0 0 24px",
            fontSize: "18px",
            fontWeight: "700",
            color: "#111",
          }}
        >
          {isEdit ? "Edit Room" : "Create Room"}
        </h2>
        <label style={lbl}>Room Name</label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Living Room"
          style={inp}
        />
        <label style={lbl}>Icon</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {ROOM_ICONS.map((icon) => (
            <button
              key={icon}
              onClick={() => setForm((f) => ({ ...f, icon }))}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                background: form.icon === icon ? "#d4f532" : "#f5f5f5",
              }}
            >
              {icon}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
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
            onClick={onSave}
            disabled={!canSave}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: canSave ? "#d4f532" : "#e8e8e8",
              cursor: canSave ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "700",
              color: "#111",
            }}
          >
            {isEdit ? "Save" : "Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
}
