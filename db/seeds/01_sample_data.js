/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("transactions").del();
  await knex("users").del();

  const insertedUsers = await knex("users")
    .insert([
      { email: "user1@example.com", password_hash: "hashed_password_1" },
      { email: "user2@example.com", password_hash: "hashed_password_2" },
    ])
    .returning("id");

  await knex("transactions").insert([
    {
      user_id: insertedUsers[0].id,
      amount: 15.99,
      category: "Food",
      title: "Lunch",
      transaction_date: new Date("2023-10-01"),
    },
    {
      user_id: insertedUsers[0].id,
      is_income: true,
      amount: 2000.0,
      category: "Income",
      title: "Salary",
    },
  ]);
};
