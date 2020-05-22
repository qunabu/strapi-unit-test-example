const fs = require("fs");
const { setupStrapi } = require("./helpers/strapi");

/** this code is called once before any test is called */
beforeAll(async (done) => {
  await setupStrapi(); // singleton so it can be called many times
  done();
});

/** this code is called once before all the tested are finished */
afterAll(async (done) => {
  //delete test database after all tests
  const tmpDbFile = `${__dirname}/../${strapi.config.currentEnvironment.database.connections.default.settings.filename}`;
  if (fs.existsSync(tmpDbFile)) {
    fs.unlinkSync(tmpDbFile);
  }
  done();
});

it("strapi is defined", async (done) => {
  expect(strapi).toBeDefined();
  done();
});

require("./hello");
require("./user");
