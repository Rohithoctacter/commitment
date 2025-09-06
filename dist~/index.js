// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  goals;
  constructor() {
    this.goals = /* @__PURE__ */ new Map();
  }
  async createGoal(insertGoal) {
    for (const [id2, goal2] of this.goals) {
      if (goal2.isActive === "true") {
        this.goals.set(id2, { ...goal2, isActive: "false" });
      }
    }
    const id = randomUUID();
    const goal = {
      ...insertGoal,
      id,
      completedDays: 0,
      startDate: /* @__PURE__ */ new Date(),
      lastCheckIn: null,
      isActive: "true"
    };
    this.goals.set(id, goal);
    return goal;
  }
  async getCurrentGoal() {
    return Array.from(this.goals.values()).find(
      (goal) => goal.isActive === "true"
    );
  }
  async checkInGoal(goalId) {
    const goal = this.goals.get(goalId);
    if (!goal || goal.isActive !== "true") {
      return void 0;
    }
    if (goal.completedDays >= goal.goalDays) {
      return goal;
    }
    const updatedGoal = {
      ...goal,
      completedDays: goal.completedDays + 1,
      lastCheckIn: /* @__PURE__ */ new Date()
    };
    this.goals.set(goalId, updatedGoal);
    return updatedGoal;
  }
  async resetCurrentGoal() {
    for (const [id, goal] of this.goals) {
      if (goal.isActive === "true") {
        this.goals.set(id, { ...goal, isActive: "false" });
        break;
      }
    }
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalDays: integer("goal_days").notNull(),
  completedDays: integer("completed_days").notNull().default(0),
  startDate: timestamp("start_date").notNull().defaultNow(),
  lastCheckIn: timestamp("last_check_in"),
  isActive: text("is_active").notNull().default("true")
});
var insertGoalSchema = createInsertSchema(goals).pick({
  goalDays: true
});
var checkInSchema = z.object({
  goalId: z.string()
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data", error });
    }
  });
  app2.get("/api/goals/current", async (req, res) => {
    try {
      const goal = await storage.getCurrentGoal();
      if (!goal) {
        return res.status(404).json({ message: "No active goal found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current goal", error });
    }
  });
  app2.post("/api/goals/checkin", async (req, res) => {
    try {
      const checkInData = checkInSchema.parse(req.body);
      const goal = await storage.checkInGoal(checkInData.goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid check-in data", error });
    }
  });
  app2.post("/api/goals/reset", async (req, res) => {
    try {
      await storage.resetCurrentGoal();
      res.json({ message: "Goal reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset goal", error });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
