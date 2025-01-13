const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
    user: process.env.PGUSER || "originei_contatos_y7vy_user",
    host: process.env.PGHOST || "dpg-cu2km11u0jms73dai7f0-a.oregon-postgres.render.com", // Ex.: "dpg-xxxxxx.render.com"
    database: process.env.PGDATABASE || "originei_contatos_y7vy",
    password: process.env.PGPASSWORD || "jJ1sDPZlv9ptrp6vwJ0Rk3jGFG2jgmY7",
    port: process.env.PGPORT || 5432, // Certifique-se que a porta está correta
    ssl: {
      rejectUnauthorized: false,
    },
  });
  

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rota para listar todos os usuários (GET /users)
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving users");
  }
});

// Rota para criar um novo usuário (POST /users)
app.post("/users", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, phone, subject, message]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

// Rota para atualizar um usuário (PUT /users/:id)
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, subject, message } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2, phone=$3, subject=$4, message=$5 WHERE id=$6 RETURNING *",
      [name, email, phone, subject, message, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating user");
  }
});

// Rota para deletar um usuário (DELETE /users/:id)
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

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
