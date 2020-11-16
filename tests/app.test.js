const fs = require("fs");
const { setupStrapi } = require("./helpers/strapi");
const { connectAndClear } = require("./helpers/pg");
const knexCleaner = require("knex-cleaner");

const settings = require("./../config/env/test/database");

jest.setTimeout(30000);

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/** this code is called once before any test is called */
beforeAll(async (done) => {
  await setupStrapi(); // singleton so it can be called many times
  done();
});

/** this code is called once before all the tested are finished */
afterAll(async (done) => {
  await knexCleaner.clean(strapi.connections.default, { mode: "delete" }); // clear database after all tests
  await strapi.server.close(); // close the server

  await sleep(1000);

  done();
});

describe("Strapi in general", () => {
  it("strapi is defined", async (done) => {
    expect(strapi).toBeDefined();
    done();
  });
});

require("./hello");
require("./user");
require("./password");
