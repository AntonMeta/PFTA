/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id").primary();
      table.string("email").unique().notNullable();
      table.string("password_hash").notNullable();
      table.timestamps(true, true);
    })
    .createTable("transactions", (table) => {
      table.increments("id").primary();
      table.boolean("is_income").notNullable().defaultTo(false);
      table.integer("user_id").references("id").inTable("users");
      table.decimal("amount", 12, 2).notNullable();
      table.string("category").notNullable();
      table.text("title");
      table.date("transaction_date").defaultTo(knex.fn.now());
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("transactions").dropTable("users");
};
