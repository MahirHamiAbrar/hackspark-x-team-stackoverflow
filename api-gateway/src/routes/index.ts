import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import rentalRoutes from './rental.routes.js';
import analyticsRoutes from './analytics.routes.js';
import agenticRoutes from './agentic.routes.js';

const router = Router();

router.use('/',          healthRoutes);
router.use('/users',     userRoutes);
router.use('/rentals',   rentalRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/chat',      agenticRoutes);

export default router;
