import { type Goal, type InsertGoal } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createGoal(goal: InsertGoal): Promise<Goal>;
  getCurrentGoal(): Promise<Goal | undefined>;
  checkInGoal(goalId: string): Promise<Goal | undefined>;
  resetCurrentGoal(): Promise<void>;
}

export class MemStorage implements IStorage {
  private goals: Map<string, Goal>;

  constructor() {
    this.goals = new Map();
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    // Deactivate any existing active goals
    for (const [id, goal] of this.goals) {
      if (goal.isActive === "true") {
        this.goals.set(id, { ...goal, isActive: "false" });
      }
    }

    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      completedDays: 0,
      startDate: new Date(),
      lastCheckIn: null,
      isActive: "true"
    };
    this.goals.set(id, goal);
    return goal;
  }

  async getCurrentGoal(): Promise<Goal | undefined> {
    return Array.from(this.goals.values()).find(
      (goal) => goal.isActive === "true"
    );
  }

  async checkInGoal(goalId: string): Promise<Goal | undefined> {
    const goal = this.goals.get(goalId);
    if (!goal || goal.isActive !== "true") {
      return undefined;
    }

    // Don't allow checking in if goal is already complete
    if (goal.completedDays >= goal.goalDays) {
      return goal;
    }

    const updatedGoal: Goal = {
      ...goal,
      completedDays: goal.completedDays + 1,
      lastCheckIn: new Date()
    };

    this.goals.set(goalId, updatedGoal);
    return updatedGoal;
  }

  async resetCurrentGoal(): Promise<void> {
    for (const [id, goal] of this.goals) {
      if (goal.isActive === "true") {
        this.goals.set(id, { ...goal, isActive: "false" });
        break;
      }
    }
  }
}

export const storage = new MemStorage();
