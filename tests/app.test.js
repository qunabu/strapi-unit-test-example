const fs = require("fs");
const { setupStrapi } = require("./helpers/strapi");

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
  await strapi.server.close();
  await sleep(1000); // clear database connection

  const dbSettings = strapi.config.get("database.connections.default.settings");

  //delete test database after all tests
  if (dbSettings && dbSettings.filename) {
    const tmpDbFile = `${__dirname}/../${dbSettings.filename}`;
    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
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
