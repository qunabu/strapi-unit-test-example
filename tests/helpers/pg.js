const clear = async (knex, dbName) => {
  try {
    await knex.raw(`DROP DATABASE IF EXISTS ${dbName};`);
  } catch (err) {
    console.error(err);
  }
  try {
    await knex.raw(`CREATE DATABASE ${dbName};`);
  } catch (err) {
    console.error(err);
  }
  console.log(`Database ${dbName} cleared`);
};

const connectAndClear = async (connection) => {
  const knex = require("knex")({
    client: "pg",
    connection: {
      user: connection.username,
      ...connection,
    },
  });
  await clear(knex, connection.database);
  await knex.destroy();
};

module.exports = {
  clear,
  connectAndClear,
};
