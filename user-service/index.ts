import express from 'express';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const port = process.env.PORT || 8001;

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'rentpi',
  host: process.env.POSTGRES_HOST || (process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost'),
  database: process.env.POSTGRES_DB || 'rentpi_local',
  password: process.env.POSTGRES_PASSWORD || 'localpassword',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      "securityScore" INTEGER DEFAULT 100
    )
  `);
}

initDb().catch(console.error);

app.get('/status', (req, res) => {
  res.json({ service: 'user-service', status: 'OK' });
});

app.post('/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, "securityScore"',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '24h' });

    res.json({ token, user });
  } catch (error: any) {
    if (error.code === '23505') { // unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '24h' });
    
    // Omit password from user object
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    const result = await pool.query('SELECT id, name, email, "securityScore" FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.listen(port, () => {
  console.log(`User service listening on port ${port}`);
});