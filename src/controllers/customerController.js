const pool = require('../config/db');

const createCustomer = async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const pointsEarned = Math.floor(amount); // 1 point per dollar spent
  try {
    await pool.query('BEGIN');
    await pool.query(
      'INSERT INTO transactions (customer_id, amount, points_earned) VALUES ($1, $2, $3)',
      [id, amount, pointsEarned]
    );
    await pool.query('UPDATE customers SET points = points + $1 WHERE id = $2', [
      pointsEarned,
      id,
    ]);
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Transaction added successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};

const redeemReward = async (req, res) => {
  const { id } = req.params;
  const { reward_id } = req.body;
  try {
    const reward = await pool.query('SELECT * FROM rewards WHERE id = $1', [reward_id]);
    if (reward.rows.length === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    const customer = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customer.rows[0].points < reward.rows[0].points_required) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    await pool.query('BEGIN');
    await pool.query(
      'INSERT INTO redemptions (customer_id, reward_id) VALUES ($1, $2)',
      [id, reward_id]
    );
    await pool.query(
      'UPDATE customers SET points = points - $1 WHERE id = $2',
      [reward.rows[0].points_required, id]
    );
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Reward redeemed successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCustomer,
  getCustomer,
  addTransaction,
  redeemReward,
};