const { describe, beforeAll, afterAll, it, expect } = require("@jest/globals");
const request = require("supertest");
const {
  updatePluginStore,
  responseHasError,
  setupStrapi,
  stopStrapi,
  sleep,
} = require("./../helpers/strapi");
const { createUser, defaultData, mockUserData } = require("./factory");
const nodemailerMock = require("nodemailer-mock");

const fs = require("fs");

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
});

/** this code is called once before all the tested are finished */
afterAll(async () => {
  await stopStrapi();
});

describe("Default User methods", () => {
  let user;

  beforeAll(async () => {
    user = await createUser();
  });

  it("should login user and return jwt token", async () => {
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .post("/api/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: defaultData.password,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then(async (data) => {
        expect(data.body.jwt).toBeDefined();
        const verified = await strapi.plugins[
          "users-permissions"
        ].services.jwt.verify(data.body.jwt);

        expect(data.body.jwt === jwt || !!verified).toBe(true); // jwt does have a random seed, each issue can be different
      });
  });

  it("should return users data for authenticated user", async () => {
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .get("/api/users/me")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + jwt)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.id).toBe(user.id);
        expect(data.body.username).toBe(user.username);
        expect(data.body.email).toBe(user.email);
      });
  });

  it("should allow register users ", async () => {
    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .post("/api/auth/local/register")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        ...mockUserData(),
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((data) => {
        expect(data.body).toBeDefined();
        expect(data.body.jwt).toBeDefined();
        expect(data.body.user).toBeDefined();
      });
  });
});

describe("Confirmation User methods", () => {
  let user;

  beforeAll(async () => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: true,
    });

    user = await createUser({
      confirmed: false,
    });
  });

  afterAll(async () => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: false,
    });
  });

  it("unconfirmed user should not login", async () => {
    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .post("/api/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: defaultData.password,
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((data) => {
        expect(responseHasError("ApplicationError", data.body)).toBe(true);
      });
  });
});
