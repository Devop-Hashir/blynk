const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const deviceRoutes = require("./routes/device.routes");
const roomRoutes = require("./routes/room.routes");
const voiceCommandRoutes = require("./routes/voiceCommand.routes");

const app = express();
app.use(cors({
  origin: '*',
  credentials: false  // must be false when origin is *
}))
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/voice-commands", voiceCommandRoutes);
// Add this so the diagnostic tool sees the path as "Alive"
// app.get("/device", (req, res) => {
//   res.status(200).send("WebSocket endpoint is active. Please connect via WSS.");
// });

module.exports = app;
