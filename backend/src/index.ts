import express from 'express';
import { pool } from './db';

const app = express();
app.use(express.json());

// ToDo一覧取得
app.get('/todos', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM todos');
  res.json(rows);
});

// ToDo追加
app.post('/todos', async (req, res) => {
  const { title } = req.body;
  await pool.query('INSERT INTO todos (title) VALUES (?)', [title]);
  res.status(201).send();
});

app.listen(3000, () => console.log('Server running on port 3000'));
