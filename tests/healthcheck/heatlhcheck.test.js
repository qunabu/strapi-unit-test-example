const { describe, beforeAll, afterAll, it, expect } = require("@jest/globals");
const { setupStrapi, stopStrapi } = require("./../helpers/strapi");

beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
});

afterAll(async () => {
  await stopStrapi();
});

describe("Strapi is defined", () => {
  it("just works", () => {
    // const
    expect(strapi).toBeDefined();
  });
});
