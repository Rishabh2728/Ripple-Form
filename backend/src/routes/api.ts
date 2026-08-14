import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';

const router = Router();

router.get('/dashboard', DashboardController.getDashboard);
router.post('/meals', DashboardController.addMeal);
router.delete('/meals/:id', DashboardController.deleteMeal);
router.put('/goal', DashboardController.updateGoal);
router.get('/foods', DashboardController.getFoods);
router.post('/scan', DashboardController.scanImage);

export default router;
