const { beforeAll, afterAll, describe, it, expect } = require('@jest/globals');
const fs = require("fs");
const { setupStrapi } = require("./helpers/strapi");

jest.setTimeout(30000);

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
});

/** this code is called once before all the tested are finished */
afterAll(async () => {
  const dbSettings = strapi.config.get("database.connections.default.settings");

  //close server to release the db-file
  await strapi.destroy();

  //delete test database after all tests
  if (dbSettings && dbSettings.filename) {
    const tmpDbFile = `${__dirname}/../${dbSettings.filename}`;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
});

describe("Strapi in general", () => {
  it("strapi is defined", async () => {
    expect(strapi).toBeDefined();
  });
});

require("./hello");
require("./user");
require("./password");
require("./todo-list");
