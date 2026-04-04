require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

const server = http.createServer(app);

// ─── Socket.io Server ────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // ── ESP32 registers ────────────────────────────
  socket.on("device_register", (data) => {
    // join a room named after deviceId
    socket.join(data.deviceId);
    socket.deviceId = data.deviceId;
    socket.clientType = "device";
    console.log(`✅ Device registered: ${data.deviceId}`);
    socket.emit("registered", { message: "Device connected" });
  });

  // ── Dashboard registers ────────────────────────
  socket.on("dashboard_register", (data) => {
    socket.join(data.userId);
    socket.userId = data.userId;
    socket.clientType = "dashboard";
    console.log(`✅ Dashboard registered: ${data.userId}`);
  });

  // ── Dashboard sends control command ───────────
  socket.on("control", (data) => {
    // data = { deviceId, pin, state, userId }
    console.log(`Control: device=${data.deviceId} pin=${data.pin} state=${data.state}`);

    // send command to ESP32 room
    io.to(data.deviceId).emit("command", {
      pin: data.pin,
      state: data.state,
    });
  });

  // ── ESP32 sends status back ────────────────────
  socket.on("status_update", (data) => {
    // data = { userId, deviceId, pin, state }
    // forward to dashboard room
    io.to(data.userId).emit("status_update", {
      deviceId: data.deviceId,
      pin: data.pin,
      state: data.state,
    });
  });

  // ── Disconnect ────────────────────────────────
  socket.on("disconnect", () => {
    if (socket.clientType === "device") {
      console.log(`❌ Device disconnected: ${socket.deviceId}`);
      // notify dashboard that device is offline
      io.emit("device_offline", { deviceId: socket.deviceId });
    }
    if (socket.clientType === "dashboard") {
      console.log(`Dashboard disconnected: ${socket.userId}`);
    }
  });
});

// make io accessible in controllers
app.set("io", io);

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});