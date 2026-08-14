import { Request, Response } from 'express';
import { MealService } from '../services/mealService';
import { FitnessGoalType } from '../types';

export class DashboardController {
  public static getDashboard(req: Request, res: Response) {
    try {
      const state = MealService.getDashboardState();
      return res.status(200).json(state);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to retrieve dashboard.' });
    }
  }

  public static addMeal(req: Request, res: Response) {
    try {
      const { foodName, foodId, weight } = req.body;
      const parsedWeight = parseFloat(weight);

      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        return res.status(400).json({
          error: 'Invalid weight. Portion must be a positive number greater than 0.'
        });
      }

      const inputName = foodName || foodId;
      if (!inputName || String(inputName).trim() === '') {
        return res.status(400).json({ error: 'Food name is required.' });
      }

      const meal = MealService.addMeal(String(inputName), parsedWeight);
      const updatedDashboard = MealService.getDashboardState();

      return res.status(201).json({
        success: true,
        meal,
        dashboard: updatedDashboard
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to add meal.' });
    }
  }

  public static deleteMeal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = MealService.deleteMeal(id);

      if (!success) {
        return res.status(404).json({ error: `Meal with ID '${id}' not found.` });
      }

      const updatedDashboard = MealService.getDashboardState();
      return res.status(200).json({
        success: true,
        message: 'Meal deleted successfully.',
        dashboard: updatedDashboard
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to delete meal.' });
    }
  }

  public static updateGoal(req: Request, res: Response) {
    try {
      const { goal } = req.body;
      if (!goal || !['weightLoss', 'maintenance', 'muscleGain'].includes(goal)) {
        return res.status(400).json({
          error: 'Invalid fitness goal. Options are: weightLoss, maintenance, muscleGain.'
        });
      }

      const updatedDashboard = MealService.updateGoal(goal as FitnessGoalType);
      return res.status(200).json({
        success: true,
        dashboard: updatedDashboard
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || 'Failed to update fitness goal.' });
    }
  }

  public static getFoods(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const foods = MealService.searchFoods(search as string);
      return res.status(200).json(foods);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to search foods.' });
    }
  }

  public static scanImage(req: Request, res: Response) {
    try {
      // Simulate backend AI food image recognition pipeline
      const scanResult = MealService.simulateImageScan();
      return res.status(200).json({
        success: true,
        food: scanResult.food,
        suggestedWeight: scanResult.suggestedWeight,
        message: 'Mock AI scan successfully detected food.'
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to process food image.' });
    }
  }
}
