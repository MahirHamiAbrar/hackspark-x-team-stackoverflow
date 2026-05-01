import { Router } from 'express';

const router = Router();

router.all('/{*splat}', (req, res) => {
  res.status(501).json({ error: 'Rental service routes not implemented yet' });
});

export default router;
