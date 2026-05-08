const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const supabase = require("./supabaseClient.js");

dotenv.config({ override: true });

const app = express();
const Routes = require("./routes/route.js");

const PORT = process.env.PORT || 3000;

const allowedOrigin = process.env.ORIGIN;
const devLocalhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / curl / server-to-server (no Origin header)
    if (!origin) return callback(null, true);

    // Exact allowlist via env
    if (allowedOrigin && origin === allowedOrigin) return callback(null, true);

    // Dev convenience: allow any localhost port
    if (!allowedOrigin && devLocalhostOrigin.test(origin)) return callback(null, true);

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.status(200).send("TRACADEMIX Backend running successfully with Supabase");
});

app.use("/", Routes);

// Verify Supabase Initialization
if (supabase) {
  console.log("Supabase Client Initialized");
}

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
