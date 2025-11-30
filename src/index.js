import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import Routes
// PASTIKAN file-file ini ada di dalam folder src/routes/
import gadgetRoutes from "./routes/gadgetRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- 1. CEK KONFIGURASI ENV (Supaya tidak bingung kalau error) ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error("\n========================================================");
  console.error("❌  FATAL ERROR: Konfigurasi Supabase Hilang!");
  console.error("    Buat file .env dan isi SUPABASE_URL serta SUPABASE_KEY");
  console.error("========================================================\n");
}

// --- 2. MIDDLEWARE ---
app.use(cors()); // Izinkan React mengakses API
app.use(express.json()); // Supaya bisa baca JSON dari body request

// Logger: Mencatat setiap request yang masuk ke terminal
app.use((req, res, next) => {
  console.log(`[LOG] ${new Date().toLocaleTimeString()} -> ${req.method} ${req.url}`);
  next();
});

// --- 3. ROUTES API ---
app.use("/api/gadgets", gadgetRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);

// --- 4. ROOT ROUTE (Untuk Cek Server di Browser) ---
app.get("/", (req, res) => {
  res.json({
    status: "Online",
    message: "Server API Katalog Gadget Berjalan Normal 🚀",
    database_config: process.env.SUPABASE_URL ? "Terdeteksi ✅" : "Hilang ❌",
    time: new Date().toISOString()
  });
});

// --- 5. 404 HANDLER (Jika akses route yang salah) ---
app.use((req, res) => {
  console.warn(`[404] Akses ditolak: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} tidak ditemukan.`
  });
});

// --- 6. GLOBAL ERROR HANDLER (Anti-Crash) ---
app.use((err, req, res, next) => {
  console.error("[SERVER ERROR]:", err.message);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal server.",
    error: err.message
  });
});

// --- JALANKAN SERVER ---
app.listen(port, () => {
  console.log(`\n🚀 Server Berjalan di: http://localhost:${port}`);
  console.log(`   - Cek Status: Buka browser dan akses http://localhost:${port}`);
  console.log(`   - Cek Data:   Akses http://localhost:${port}/api/gadgets\n`);
});