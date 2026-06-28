import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import apiRoutes from "./server/routes/apiRoutes";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Mount modular API routes
app.use("/api", apiRoutes);

// Setup Vite Dev Middleware / Static production files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support Express v4 SPA routing wildcard
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Auntie.ai] Server running on http://localhost:${PORT}`);
  });
}

startServer();
