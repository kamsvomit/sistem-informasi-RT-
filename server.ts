import express from "express";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import path from "path";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

async function startServer() {
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

      if (!user) {
        return res.status(404).json({ error: "Identitas tidak ditemukan" });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: "Password salah" });
      }

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
      const data = req.body;
      // Remove id if it exists to let Prisma generate it or use the one from body
      const { id, ...rest } = data;
      const newWarga = await prisma.warga.create({ 
        data: {
          ...rest,
          id: id || undefined
        } 
      });
      res.json(newWarga);
    } catch (error) {
      console.error(error);
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
      const data = req.body;
      const updated = await prisma.warga.update({
        where: { id },
        data
      });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update warga" });
    }
  });

  // Keuangan
  app.get("/api/keuangan", async (req, res) => {
    try {
      const data = await prisma.keuangan.findMany({
        orderBy: { tanggal: 'desc' }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch keuangan" });
    }
  });

  app.post("/api/keuangan", async (req, res) => {
    try {
      const data = req.body;
      const newItem = await prisma.keuangan.create({ data });
      res.json(newItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create keuangan" });
    }
  });

  // Pengumuman
  app.get("/api/pengumuman", async (req, res) => {
    try {
      const data = await prisma.pengumuman.findMany({
        orderBy: { tanggal: 'desc' }
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pengumuman" });
    }
  });

  // Aspirasi
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

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
