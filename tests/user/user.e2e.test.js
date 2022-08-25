const { describe, beforeAll, afterAll, it, expect } = require("@jest/globals");
const request = require("supertest");
const {
  updatePluginStore,
  responseHasError,
  setupStrapi,
  stopStrapi,
  grantPrivilege,
  sleep,
} = require("./../helpers/strapi");
const { createUser, defaultData, mockUserData } = require("./factory");
const nodemailerMock = require("nodemailer-mock");

/** this code is called once before any test is called */
beforeAll(async () => {
  await setupStrapi(); // singleton so it can be called many times
});

/** this code is called once before all the tested are finished */
afterAll(async () => {
  await stopStrapi();
});

describe("Confirmation User e2e test", () => {
  let user;

  beforeAll(async () => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: true,
    });

    await grantPrivilege(
      2,
      "plugin::users-permissions.controllers.auth.emailConfirmation"
    );

    user = await createUser({
      confirmed: false,
    });
  });

  afterAll(async () => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: false,
    });
  });

  it("should register, send email with confirmation link, link should confirm account", async () => {
    const userData = mockUserData();

    let userId;

    // 1. send a request to register new user

    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .post("/api/auth/local/register")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({ ...userData }) // passing confirmed should not work
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.user.username).toBe(userData.username);
        expect(response.body.user.email).toBe(userData.email);
        userId = response.body.user.id;
      });

    // 2. test if user exists in database now and it is not confirmed

    let user = await strapi.plugins["users-permissions"].services.user.fetch(
      userId
    );


    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);

    expect(user.confirmed).toBe(false);

    // 3. user should not be able to login at this stage

    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .post("/api/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: userData.password,
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((data) => {
        expect(responseHasError("ApplicationError", data.body)).toBe(true);
      });

    // 4. email is sent

    const emailsSent = nodemailerMock.mock.getSentMail();
    expect(emailsSent.length).toBeGreaterThan(0);

    // 5. fetch and test confirmation link from email content

    const confirmRegEx = /\A?confirmation=[^&|\s<"]+&*/g;

    const confirmationLink = emailsSent.reduce((acc, curr) => {
      return (
        (curr.text &&
          curr.text.match(confirmRegEx) &&
          curr.text.match(confirmRegEx)[0]) ||
        acc
      );
    }, "");

    expect(confirmationLink).toBeDefined();
    expect(confirmationLink).not.toBe("");

    // 6. calling a `email-confirmation` should confirm user and return a 302 redirect
    await request(strapi.server.httpServer) // app server is and instance of Class: http.Server
      .get(`/api/auth/email-confirmation?${confirmationLink}`)
      .expect(302);

    // 7. check in database if user in confirmed now, link from email was clicked

    user = user = await strapi.plugins["users-permissions"].services.user.fetch(
      userId
    );

    expect(user.confirmed).toBe(true);

    // 8. now it can login in

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
      .then((data) => {
        expect(data.body.jwt).toBeDefined();
      });
  });
});
