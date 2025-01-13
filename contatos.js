const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

// Configuração do Pool com SSL habilitado
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false, // Aceita certificados autoassinados
  },
});

const app = express();
const port = process.env.PORT || 5000; // Porta fornecida pelo ambiente

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rota para criar um novo usuário
app.post("/users", async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// Rota para listar todos os usuários
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving users");
  }
});

// Rota para atualizar um usuário
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *",
      [name, email, phone, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

// Rota para deletar um usuário
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting user");
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
