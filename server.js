require("dotenv").config();
const express = require("express");
const knexConfig = require("./knexfile").development;
const knex = require("knex")(knexConfig);
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Finance App API");
});

app.get("/api/transactions", async (req, res) => {
  try {
    const transactions = await knex("transactions").select("*");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await knex("transactions").where({ id }).first();
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, is_income, transaction_date, user_id } = req.body;
    const newTransaction = await knex("transactions")
      .insert({
        title,
        amount,
        is_income,
        transaction_date: transaction_date || new Date(),
        user_id: user_id || 1,
        category: category || "Other",
      })
      .returning("*");
    res.status(201).json(newTransaction[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await knex("transactions").where({ id }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
