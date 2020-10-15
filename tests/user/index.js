const request = require("supertest");
const { updatePluginStore, responseHasError } = require("./../helpers/strapi");
const { createUser, defaultData, mockUserData } = require("./factory");
const nodemailerMock = require("nodemailer-mock");

describe("Default User methods", () => {
  let user;

  beforeAll(async (done) => {
    user = await createUser(strapi);
    done();
  });

  it("should login user and return jwt token", async (done) => {
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/local")
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
        expect(data.body.jwt).not.toBe(jwt); // jwt does have a random seed, each issue should be different
      });

    done();
  });

  it("should return users data for authenticated user", async (done) => {
    const jwt = strapi.plugins["users-permissions"].services.jwt.issue({
      id: user.id,
    });

    await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/users/me")
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

    done();
  });

  it("should allow register users ", async (done) => {
    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/local/register")
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

    done();
  });
});

describe("Confirmation User methods", () => {
  let user;

  beforeAll(async (done) => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: true,
    });

    user = await createUser(strapi, {
      ...mockUserData(),
      confirmed: false,
    });
    done();
  });

  afterAll(async (done) => {
    await updatePluginStore("users-permissions", "advanced", {
      email_confirmation: false,
    });
    done();
  });

  it("unconfirmed user should not login", async (done) => {
    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: defaultData.password,
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((data) => {
        expect(responseHasError("Auth.form.error.confirmed", data.body)).toBe(
          true
        );
      });
    done();
  });

  // it("registartion of new user should send email", async (done) => {});

  it("should register, send email with confirmation link, link should confirm account", async (done) => {
    const userData = mockUserData();
    // 1. send a request to register new user

    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/local/register")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({ ...userData, confirmed: true }) // passing confirmed should not work
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.user.username).toBe(userData.username);
        expect(response.body.user.email).toBe(userData.email);
      });

    // 2. test if user exsits in database now and it is not cofirmed
    let user = await strapi.plugins["users-permissions"].services.user.fetch({
      username: userData.username,
    });

    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);

    expect(user.confirmed).toBe(null);

    // 3. user should not be able to login at this stage

    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: userData.password,
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((data) => {
        expect(responseHasError("Auth.form.error.confirmed", data.body)).toBe(
          true
        );
      });

    // 4. email is sent

    const emailsSent = nodemailerMock.mock.getSentMail();
    expect(emailsSent.length).toBeGreaterThan(0);

    // 5. fetch and test confirmation link from email content

    const confirmRegEx = /\A?confirmation=[^&|\s|<|"]+&*/g;
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
    await request(strapi.server) // app server is and instance of Class: http.Server
      .get(`/auth/email-confirmation?${confirmationLink}`)
      .expect(302);

    // 7. check in database if user in confirmed now, link from email was clicked

    user = await strapi.plugins["users-permissions"].services.user.fetch({
      username: userData.username,
    });

    expect(user.confirmed).toBe(true);

    // 8. now it can login in

    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/local")
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

    done();
  });
});
