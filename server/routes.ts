import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, checkInSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new goal
  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data", error });
    }
  });

  // Get current active goal
  app.get("/api/goals/current", async (req, res) => {
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

  // Check in for a goal
  app.post("/api/goals/checkin", async (req, res) => {
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

  // Reset/deactivate current goal
  app.post("/api/goals/reset", async (req, res) => {
    try {
      await storage.resetCurrentGoal();
      res.json({ message: "Goal reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset goal", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
