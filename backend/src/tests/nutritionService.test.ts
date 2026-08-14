import { describe, it, expect, beforeEach } from 'vitest';
import { NutritionService } from '../services/nutritionService';
import { MealService } from '../services/mealService';
import { db } from '../db/database';
import { MOCK_FOODS } from '../config/mockFoods';
import { FITNESS_GOALS } from '../config/fitnessGoals';

describe('Nutrient Scaling Algorithm & Server Business Logic', () => {
  const chicken = MOCK_FOODS.find((f) => f.id === 'chicken-breast')!;

  beforeEach(() => {
    db.clearAllMeals();
    db.setGoal('maintenance');
  });

  it('calculates exact 1x nutrients for 100g portion', () => {
    const result = NutritionService.calculateNutrients(chicken, 100);
    expect(result.calories).toBe(165);
    expect(result.protein).toBe(31);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(3.6);
  });

  it('calculates exact 2x nutrients for 200g portion', () => {
    const result = NutritionService.calculateNutrients(chicken, 200);
    expect(result.calories).toBe(330);
    expect(result.protein).toBe(62);
    expect(result.carbs).toBe(0);
    expect(result.fat).toBe(7.2);
  });

  it('handles decimal weight portion correctly (125.5g)', () => {
    const result = NutritionService.calculateNutrients(chicken, 125.5);
    expect(result.calories).toBe(207);
    expect(result.protein).toBe(38.9);
  });

  it('aggregates multiple logged meals correctly', () => {
    MealService.addMeal('Chicken Breast', 200); // 330 kcal, 62g protein, 0g carbs, 7.2g fat
    MealService.addMeal('Rice (Cooked)', 150); // 195 kcal, 4.1g protein, 42g carbs, 0.45g fat

    const state = MealService.getDashboardState();
    expect(state.totals.calories).toBe(525);
    expect(state.totals.protein).toBe(66.1);
    expect(state.totals.carbs).toBe(42);
    expect(state.totals.fat).toBe(7.6);
  });

  it('recalculates totals and remaining calories immediately after meal deletion', () => {
    const meal1 = MealService.addMeal('Chicken Breast', 200);
    const meal2 = MealService.addMeal('Banana', 100);

    let state = MealService.getDashboardState();
    expect(state.meals.length).toBe(2);

    MealService.deleteMeal(meal1.id);

    state = MealService.getDashboardState();
    expect(state.meals.length).toBe(1);
    expect(state.totals.calories).toBe(89); // Banana 100g
    expect(state.remainingCalories).toBe(2200 - 89);
  });

  it('evaluates over-budget status when calories exceed daily budget target', () => {
    // Target maintenance = 2200
    MealService.addMeal('Chicken Breast', 1000); // 1650 kcal
    let state = MealService.getDashboardState();
    expect(state.budgetExceeded).toBe(false);

    MealService.addMeal('Paneer (Cottage Cheese)', 300); // 795 kcal -> total 2445 kcal
    state = MealService.getDashboardState();
    expect(state.budgetExceeded).toBe(true);
    expect(state.overBudgetAmount).toBe(245);
  });

  it('preserves existing meals and recalculates targets when changing fitness goal', () => {
    MealService.addMeal('Chicken Breast', 200); // 330 kcal

    let state = MealService.getDashboardState(); // maintenance: 2200 kcal
    expect(state.targets.calories).toBe(2200);
    expect(state.meals.length).toBe(1);

    // Switch to Weight Loss (1800 kcal target)
    state = MealService.updateGoal('weightLoss');
    expect(state.targets.calories).toBe(1800);
    expect(state.meals.length).toBe(1);
    expect(state.totals.calories).toBe(330);
    expect(state.remainingCalories).toBe(1800 - 330);

    // Switch to Muscle Gain (2800 kcal target)
    state = MealService.updateGoal('muscleGain');
    expect(state.targets.calories).toBe(2800);
    expect(state.meals.length).toBe(1);
    expect(state.remainingCalories).toBe(2800 - 330);
  });

  it('rejects invalid portion weights (0g, negative weight, NaN)', () => {
    expect(() => MealService.addMeal('Chicken Breast', 0)).toThrow();
    expect(() => MealService.addMeal('Chicken Breast', -50)).toThrow();
    expect(() => MealService.addMeal('Chicken Breast', NaN)).toThrow();
    expect(() => MealService.addMeal('', 100)).toThrow();
  });
});
