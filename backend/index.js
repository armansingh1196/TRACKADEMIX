const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const supabase = require("./supabaseClient.js");

dotenv.config();

const app = express();
const Routes = require("./routes/route.js");

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.ORIGIN,
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
