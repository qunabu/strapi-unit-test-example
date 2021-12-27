const fs = require("fs");
const { setupStrapi, stopStrapi } = require("./helpers/strapi");

jest.setTimeout(30000);

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
});

/** this code is called once before all the tested are finished */
afterAll(async () => {
  await stopStrapi();
});

describe("Strapi in general", () => {
  it("strapi is defined", async () => {
    expect(strapi).toBeDefined();
  });
});

require("./hello");
require("./user");
require("./password");
