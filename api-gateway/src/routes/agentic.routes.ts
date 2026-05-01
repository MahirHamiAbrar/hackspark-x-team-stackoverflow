import { Router } from 'express';

const router = Router();

router.all('/*', (req, res) => {
  res.status(501).json({ error: 'Agentic service routes not implemented yet' });
});

export default router;
