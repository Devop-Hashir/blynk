require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { WebSocketServer } = require("ws");
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

const server = http.createServer(app);

const onlineDevices = new Map();

const wss = new WebSocketServer({ noServer: true });

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  path: "/socket.io/",
});

// Capture Socket.IO upgrade listeners AFTER it registers them
const sioUpgradeListeners = server.listeners("upgrade").slice();
server.removeAllListeners("upgrade");

server.on("upgrade", (req, socket, head) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  console.log(`[UPGRADE] path="${pathname}"`);

  if (pathname === "/device") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    for (const fn of sioUpgradeListeners) {
      fn.call(server, req, socket, head);
    }
  }
});

// ── ESP32 handler ─────────────────────────────────────────────────────────────
wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`\n[ESP32] ✅ Raw WS connected from ${ip}`);
  let deviceId = null;

  ws.on("message", (raw) => {
    const str = raw.toString();
    console.log(`[ESP32 →  SERVER] ${str}`);

    let data;
    try { data = JSON.parse(str); }
    catch { console.log("[ESP32] ❌ Bad JSON"); return; }

    if (data.type === "register") {
      deviceId = data.deviceId;
      ws.deviceId = deviceId;
      onlineDevices.set(deviceId, ws);

      const reply = JSON.stringify({ type: "registered", deviceId });
      console.log(`[SERVER → ESP32] ${reply}`);
      ws.send(reply);

      io.emit("device_online", { deviceId });
      io.emit("online_devices", { deviceIds: [...onlineDevices.keys()] });
      console.log(`[SERVER → DASHBOARD] device_online + online_devices: [${[...onlineDevices.keys()]}]`);
    }

    if (data.type === "state_update") {
      console.log(`[SERVER → DASHBOARD] status_update pin=${data.pin} state=${data.state}`);
      io.emit("status_update", {
        deviceId: data.deviceId,
        pin: data.pin,
        state: data.state,
      });
    }

    if (data.type === "pong") {
      console.log(`[ESP32] pong received`);
    }
  });

  ws.on("close", (code, reason) => {
    console.log(`\n[ESP32] ❌ Disconnected — code=${code} reason="${reason.toString()}"`);
    if (deviceId) {
      onlineDevices.delete(deviceId);
      io.emit("device_offline", { deviceId });
      io.emit("online_devices", { deviceIds: [...onlineDevices.keys()] });
    }
  });

  ws.on("error", (err) => {
    console.log(`[ESP32] ⚠️ WS error: ${err.message}`);
  });
});

// ── Dashboard handler ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`\n[DASHBOARD] ✅ Connected: ${socket.id}`);

  socket.on("dashboard_register", ({ userId }) => {
    socket.join(userId);
    socket.userId = userId;
    const deviceIds = [...onlineDevices.keys()];
    console.log(`[DASHBOARD] Registered userId=${userId} — sending online_devices: [${deviceIds}]`);
    socket.emit("online_devices", { deviceIds });
  });

  socket.on("get_online_devices", () => {
    const deviceIds = [...onlineDevices.keys()];
    console.log(`[DASHBOARD] get_online_devices → [${deviceIds}]`);
    socket.emit("online_devices", { deviceIds });
  });

  socket.on("control", ({ deviceId, pin, state }) => {
    console.log(`\n[DASHBOARD → SERVER] control deviceId=${deviceId} pin=${pin} state=${state}`);
    const deviceWs = onlineDevices.get(deviceId);
    if (deviceWs && deviceWs.readyState === deviceWs.OPEN) {
      const cmd = JSON.stringify({ type: "command", pin, state });
      console.log(`[SERVER → ESP32] ${cmd}`);
      deviceWs.send(cmd);
    } else {
      console.log(`[SERVER] ❌ Device ${deviceId} not in onlineDevices map — cannot forward`);
      console.log(`[SERVER] Current online devices: [${[...onlineDevices.keys()]}]`);
      socket.emit("device_error", { deviceId, message: "Device is offline" });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log(`[DASHBOARD] ❌ Disconnected: ${socket.id} reason=${reason}`);
  });
});

app.set("io", io);
app.set("onlineDevices", onlineDevices);

app.get("/health", (req, res) => {
  const deviceIds = [...onlineDevices.keys()];
  console.log(`[HEALTH] online devices: [${deviceIds}]`);
  res.json({ status: "ok", onlineDevices: deviceIds });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server on http://localhost:${PORT}`);
  console.log(`   ESP32  → ws://localhost:${PORT}/device`);
  console.log(`   Dash   → http://localhost:${PORT}/socket.io/\n`);
});