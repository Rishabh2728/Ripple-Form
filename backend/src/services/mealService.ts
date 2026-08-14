import { db } from '../db/database';
import { MOCK_FOODS } from '../config/mockFoods';
import { FITNESS_GOALS } from '../config/fitnessGoals';
import { NutritionService } from './nutritionService';
import { FitnessGoalType, MealEntry, MockScanResult, FoodItem } from '../types';

export class MealService {
  /**
   * Returns current authoritative dashboard state.
   */
  static getDashboardState() {
    const activeGoalKey = db.getGoal();
    const goalConfig = FITNESS_GOALS[activeGoalKey] || FITNESS_GOALS.maintenance;
    const meals = db.getMeals();
    return NutritionService.computeDashboardState(meals, goalConfig);
  }

  /**
   * Adds a meal item after performing nutrient scaling on the server.
   */
  static addMeal(foodInput: string, weight: number): MealEntry {
    if (!foodInput || typeof foodInput !== 'string' || foodInput.trim() === '') {
      throw new Error('Food name is required.');
    }

    if (weight === undefined || weight === null || isNaN(weight) || weight <= 0) {
      throw new Error('Portion weight must be a positive number greater than 0.');
    }

    const cleanInput = foodInput.trim().toLowerCase();
    
    // Find in mock foods or create custom food item per 100g if unknown
    let food = MOCK_FOODS.find(
      (f) => f.id === cleanInput || f.name.toLowerCase() === cleanInput
    );

    if (!food) {
      // Partial match attempt
      food = MOCK_FOODS.find((f) => f.name.toLowerCase().includes(cleanInput));
    }

    // If still not found, construct a sensible default base food item
    if (!food) {
      food = {
        id: `custom-${Date.now()}`,
        name: foodInput.trim(),
        caloriesPer100g: 150, // default estimate for custom food
        proteinPer100g: 10,
        carbsPer100g: 15,
        fatPer100g: 5
      };
    }

    // Calculate nutrients server-side
    const nutrients = NutritionService.calculateNutrients(food, weight);

    const newMeal: MealEntry = {
      id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      foodId: food.id,
      foodName: food.name,
      weight,
      calories: nutrients.calories,
      protein: nutrients.protein,
      carbs: nutrients.carbs,
      fat: nutrients.fat,
      loggedAt: new Date().toISOString()
    };

    db.addMeal(newMeal);
    return newMeal;
  }

  /**
   * Deletes a meal by ID.
   */
  static deleteMeal(id: string): boolean {
    if (!id) throw new Error('Meal ID is required.');
    return db.deleteMeal(id);
  }

  /**
   * Updates current active fitness goal without resetting meals.
   */
  static updateGoal(goalKey: FitnessGoalType) {
    if (!FITNESS_GOALS[goalKey]) {
      throw new Error(`Invalid fitness goal: ${goalKey}`);
    }
    db.setGoal(goalKey);
    return this.getDashboardState();
  }

  /**
   * Searches available mock food library.
   */
  static searchFoods(query?: string): FoodItem[] {
    if (!query || query.trim() === '') {
      return MOCK_FOODS;
    }
    const q = query.trim().toLowerCase();
    return MOCK_FOODS.filter((f) => f.name.toLowerCase().includes(q));
  }

  /**
   * Simulated AI Food Photo Scanner result.
   */
  static simulateImageScan(): MockScanResult {
    // Pick a random mock food item or a default popular item (e.g., Chicken Breast or Salmon or Paneer)
    const presetItems = [
      { food: MOCK_FOODS[0], weight: 200 }, // Chicken Breast 200g
      { food: MOCK_FOODS[10], weight: 180 }, // Salmon 180g
      { food: MOCK_FOODS[5], weight: 150 }, // Paneer 150g
      { food: MOCK_FOODS[2], weight: 120 } // Eggs 120g
    ];

    const randomPick = presetItems[Math.floor(Math.random() * presetItems.length)];
    return {
      food: randomPick.food,
      suggestedWeight: randomPick.weight
    };
  }
}
