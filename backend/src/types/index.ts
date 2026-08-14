export type FitnessGoalType = 'weightLoss' | 'maintenance' | 'muscleGain';

export interface FitnessGoalConfig {
  id: FitnessGoalType;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  weight: number; // in grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string; // ISO timestamp
}

export interface DashboardState {
  goal: {
    id: FitnessGoalType;
    label: string;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  remainingCalories: number;
  budgetExceeded: boolean;
  overBudgetAmount: number;
  meals: MealEntry[];
}

export interface MockScanResult {
  food: FoodItem;
  suggestedWeight: number;
}
