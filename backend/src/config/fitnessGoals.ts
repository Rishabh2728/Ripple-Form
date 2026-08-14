import { FitnessGoalConfig, FitnessGoalType } from '../types';

export const FITNESS_GOALS: Record<FitnessGoalType, FitnessGoalConfig> = {
  weightLoss: {
    id: 'weightLoss',
    label: 'Weight Loss',
    calories: 1800,
    protein: 120,
    carbs: 180,
    fat: 60
  },
  maintenance: {
    id: 'maintenance',
    label: 'Maintenance',
    calories: 2200,
    protein: 140,
    carbs: 250,
    fat: 70
  },
  muscleGain: {
    id: 'muscleGain',
    label: 'Muscle Gain',
    calories: 2800,
    protein: 180,
    carbs: 320,
    fat: 80
  }
};
