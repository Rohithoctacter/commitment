import type { Handler } from '@netlify/functions';
import { insertGoalSchema, checkInSchema, type Goal, type InsertGoal } from '../../shared/schema';

// Note: In-memory storage won't work with serverless functions
// You'll need to use a database for persistent storage in production
class MemStorage {
  private goals: Map<string, Goal> = new Map();

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    // Deactivate any existing active goals
    for (const [id, goal] of this.goals) {
      if (goal.isActive === "true") {
        this.goals.set(id, { ...goal, isActive: "false" });
      }
    }

    const id = crypto.randomUUID();
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

const storage = new MemStorage();

export const handler: Handler = async (event, context) => {
  const { path, httpMethod, body } = event;
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // Parse API path
    const apiPath = path.replace('/.netlify/functions/api', '');
    
    // Route handling
    if (httpMethod === 'POST' && apiPath === '/goals') {
      const goalData = insertGoalSchema.parse(JSON.parse(body || '{}'));
      const goal = await storage.createGoal(goalData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(goal),
      };
    }

    if (httpMethod === 'GET' && apiPath === '/goals/current') {
      const goal = await storage.getCurrentGoal();
      if (!goal) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'No active goal found' }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(goal),
      };
    }

    if (httpMethod === 'POST' && apiPath === '/goals/checkin') {
      const checkInData = checkInSchema.parse(JSON.parse(body || '{}'));
      const goal = await storage.checkInGoal(checkInData.goalId);
      if (!goal) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Goal not found' }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(goal),
      };
    }

    if (httpMethod === 'POST' && apiPath === '/goals/reset') {
      await storage.resetCurrentGoal();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Goal reset successfully' }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Not Found' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal Server Error', error: String(error) }),
    };
  }
};