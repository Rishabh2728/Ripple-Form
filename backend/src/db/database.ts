import fs from 'fs';
import path from 'path';
import { MealEntry, FitnessGoalType } from '../types';

interface DatabaseSchema {
  activeGoal: FitnessGoalType;
  meals: MealEntry[];
}

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.sqlite.json');

const defaultData: DatabaseSchema = {
  activeGoal: 'maintenance',
  meals: []
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Error reading DB file, initializing default:', err);
    }
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  public getGoal(): FitnessGoalType {
    return this.data.activeGoal;
  }

  public setGoal(goal: FitnessGoalType): void {
    this.data.activeGoal = goal;
    this.saveData(this.data);
  }

  public getMeals(): MealEntry[] {
    return [...this.data.meals];
  }

  public addMeal(meal: MealEntry): void {
    this.data.meals.unshift(meal); // Most recent first
    this.saveData(this.data);
  }

  public deleteMeal(id: string): boolean {
    const initialLength = this.data.meals.length;
    this.data.meals = this.data.meals.filter((m) => m.id !== id);
    const deleted = this.data.meals.length < initialLength;
    if (deleted) {
      this.saveData(this.data);
    }
    return deleted;
  }

  public clearAllMeals(): void {
    this.data.meals = [];
    this.saveData(this.data);
  }
}

export const db = new Database();
