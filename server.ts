import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// Setup __dirname untuk ES Module (Vite/Node)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- API ROUTES ---

// Auth & Warga
app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await prisma.warga.findFirst({
      where: {
        OR: [
          { nik: identifier },
          { email: identifier },
          { noHP: identifier }
        ]
      }
    });
    if (!user) return res.status(404).json({ error: "Identitas tidak ditemukan" });
    if (user.password !== password) return res.status(401).json({ error: "Password salah" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/warga", async (req, res) => {
  try {
    const warga = await prisma.warga.findMany();
    res.json(warga);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch warga" });
  }
});

app.post("/api/warga", async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const newWarga = await prisma.warga.create({ 
      data: { ...rest, id: id || undefined } 
    });
    res.json(newWarga);
  } catch (error) {
    res.status(500).json({ error: "Failed to create warga" });
  }
});

app.delete("/api/keuangan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.keuangan.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete keuangan" });
  }
});

app.put("/api/warga/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.warga.update({
      where: { id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update warga" });
  }
});

app.get("/api/keuangan", async (req, res) => {
  try {
    const data = await prisma.keuangan.findMany({ orderBy: { tanggal: 'desc' } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch keuangan" });
  }
});

app.post("/api/keuangan", async (req, res) => {
  try {
    const newItem = await prisma.keuangan.create({ data: req.body });
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create keuangan" });
  }
});

app.get("/api/pengumuman", async (req, res) => {
  try {
    const data = await prisma.pengumuman.findMany({ orderBy: { tanggal: 'desc' } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pengumuman" });
  }
});

app.get("/api/aspirasi", async (req, res) => {
  try {
    const data = await prisma.aspirasi.findMany({
      include: { warga: true },
      orderBy: { tanggal: 'desc' }
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch aspirasi" });
  }
});

// --- PRODUCTION SERVING ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// Hanya jalankan listen jika di lokal (bukan Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// WAJIB UNTUK VERCEL
export default app;
