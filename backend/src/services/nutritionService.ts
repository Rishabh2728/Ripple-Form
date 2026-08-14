import { FoodItem, MealEntry, FitnessGoalConfig, DashboardState, FitnessGoalType } from '../types';

export class NutritionService {
  /**
   * Nutrient Scaling Algorithm:
   * Calculates nutrients based on portion weight in grams (per 100g base values).
   */
  static calculateNutrients(food: FoodItem, weightGrams: number) {
    if (weightGrams <= 0 || isNaN(weightGrams)) {
      throw new Error('Portion weight must be a positive number greater than 0.');
    }

    const multiplier = weightGrams / 100;

    return {
      calories: Math.round(food.caloriesPer100g * multiplier),
      protein: Number((food.proteinPer100g * multiplier).toFixed(1)),
      carbs: Number((food.carbsPer100g * multiplier).toFixed(1)),
      fat: Number((food.fatPer100g * multiplier).toFixed(1))
    };
  }

  /**
   * Dashboard Computation Engine:
   * Aggregates meals, applies fitness goal targets, and determines progress & over-budget state.
   */
  static computeDashboardState(
    meals: MealEntry[],
    goalConfig: FitnessGoalConfig
  ): DashboardState {
    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    // Format totals
    totals.calories = Math.round(totals.calories);
    totals.protein = Number(totals.protein.toFixed(1));
    totals.carbs = Number(totals.carbs.toFixed(1));
    totals.fat = Number(totals.fat.toFixed(1));

    const progress = {
      calories: goalConfig.calories > 0 ? Number(((totals.calories / goalConfig.calories) * 100).toFixed(2)) : 0,
      protein: goalConfig.protein > 0 ? Number(((totals.protein / goalConfig.protein) * 100).toFixed(2)) : 0,
      carbs: goalConfig.carbs > 0 ? Number(((totals.carbs / goalConfig.carbs) * 100).toFixed(2)) : 0,
      fat: goalConfig.fat > 0 ? Number(((totals.fat / goalConfig.fat) * 100).toFixed(2)) : 0
    };

    const remainingCalories = Math.max(0, goalConfig.calories - totals.calories);
    const budgetExceeded = totals.calories > goalConfig.calories;
    const overBudgetAmount = budgetExceeded ? totals.calories - goalConfig.calories : 0;

    return {
      goal: {
        id: goalConfig.id,
        label: goalConfig.label
      },
      targets: {
        calories: goalConfig.calories,
        protein: goalConfig.protein,
        carbs: goalConfig.carbs,
        fat: goalConfig.fat
      },
      totals,
      progress,
      remainingCalories,
      budgetExceeded,
      overBudgetAmount,
      meals
    };
  }
}
