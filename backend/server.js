require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const { WebSocketServer } = require("ws");
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

const server = http.createServer(app);

// ─── shared state ─────────────────────────────
const onlineDevices = new Map(); // deviceId → ws socket

// ─── Socket.io (dashboard) ────────────────────
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  path: "/socket.io/",
});

// ─── Plain WS server (ESP32) ──────────────────
const wss = new WebSocketServer({ noServer: true });

// intercept upgrades — route /device to wss, everything else to socket.io
server.on("upgrade", (req, socket, head) => {
  const url = req.url || "";
  if (url.startsWith("/device")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    // let socket.io handle its own upgrade
    io.engine.handleUpgrade(req, socket, head);
  }
});

// ─── ESP32 WS handlers ────────────────────────
wss.on("connection", (ws) => {
  console.log("🔌 ESP32 raw WS connected");
  let deviceId = null;

  ws.on("message", (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    if (data.type === "device_register") {
      deviceId = data.deviceId;
      ws.deviceId = deviceId;
      onlineDevices.set(deviceId, ws);
      console.log(`✅ Device registered: ${deviceId}`);
      console.log(`📱 Online devices now: ${[...onlineDevices.keys()]}`);
      ws.send(JSON.stringify({ type: "registered", message: "Device connected" }));
      io.emit("device_online", { deviceId });
    }

    if (data.type === "status_update") {
      io.to(data.userId).emit("status_update", {
        deviceId: data.deviceId,
        pin: data.pin,
        state: data.state,
      });
    }

    if (data.type === "ping") {
      ws.send(JSON.stringify({ type: "pong" }));
    }
  });

  ws.on("close", () => {
    if (deviceId) {
      onlineDevices.delete(deviceId);
      console.log(`❌ Device disconnected: ${deviceId}`);
      console.log(`📱 Online devices now: ${[...onlineDevices.keys()]}`);
      io.emit("device_offline", { deviceId });
    }
  });

  ws.on("error", (err) => console.error("ESP32 WS error:", err.message));
});

// ─── Socket.io handlers (dashboard) ──────────
io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on("dashboard_register", (data) => {
    socket.join(data.userId);
    socket.userId     = data.userId;
    socket.clientType = "dashboard";
    console.log(`✅ Dashboard registered: ${data.userId}`);

    const sendOnline = () => {
      const deviceIds = [...onlineDevices.keys()];
      console.log(`Sending online devices to dashboard: ${deviceIds}`);
      socket.emit("online_devices", { deviceIds });
    };
    sendOnline();
    setTimeout(sendOnline, 1000);
  });

  socket.on("get_online_devices", () => {
    const deviceIds = [...onlineDevices.keys()];
    console.log(`Re-sending online devices: ${deviceIds}`);
    socket.emit("online_devices", { deviceIds });
  });

  socket.on("control", (data) => {
    console.log(`Control: device=${data.deviceId} pin=${data.pin} state=${data.state}`);
    const deviceWs = onlineDevices.get(data.deviceId);
    if (deviceWs && deviceWs.readyState === 1) {
      deviceWs.send(JSON.stringify({ type: "command", pin: data.pin, state: data.state }));
    } else {
      console.log(`Device ${data.deviceId} not connected`);
    }
  });

  socket.on("disconnect", () => {
    if (socket.clientType === "dashboard") {
      console.log(`Dashboard disconnected: ${socket.userId}`);
    }
  });
});

app.set("io", io);
app.set("onlineDevices", onlineDevices);

app.get("/test", (req, res) => {
  res.json({
    message: "Backend working!",
    onlineDevices: [...onlineDevices.keys()],
  });
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
