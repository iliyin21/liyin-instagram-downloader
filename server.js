require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const downloadRoutes = require("./routes/download");

const app = express();
const PORT = process.env.PORT || 3000;

// Railway (dan hampir semua platform hosting) menjalankan app di belakang
// reverse proxy. Baris ini memberi tahu Express untuk percaya header
// X-Forwarded-For dari proxy tsb, supaya express-rate-limit bisa mengenali
// IP asli tiap user dengan benar (tanpa ini akan muncul warning
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR di log).
app.set("trust proxy", 1);

// --- Middleware keamanan & utilitas ---
app.use(
  helmet({
    contentSecurityPolicy: false, // dinonaktifkan agar Google Fonts & inline script frontend tetap jalan
  })
);
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Rate limiter khusus untuk endpoint API agar tidak disalahgunakan
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan. Coba lagi sebentar lagi.",
  },
});
app.use("/api", apiLimiter);

// --- Static frontend ---
app.use(express.static(path.join(__dirname, "public")));

// --- API routes ---
app.use("/api", downloadRoutes);

// Health check untuk Railway
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Fallback ke index.html untuk semua route non-API (SPA-style)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Error handler terakhir ---
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Kesalahan server internal." });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
