import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router = Router();

/** P2: User Authentication */
router.post('/register', userController.register);
router.post('/login',    userController.login);
router.get('/me',        userController.me);

/** P6: Loyalty Discount (stub — implemented when user-service adds the endpoint) */
router.get('/:id/discount', userController.discount);

export default router;
