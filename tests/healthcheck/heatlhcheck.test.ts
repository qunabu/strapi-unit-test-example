import { describe, beforeAll, afterAll, it, expect } from "@jest/globals";
import { setupStrapi, stopStrapi } from "./../helpers/strapi";

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
