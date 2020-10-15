const request = require("supertest");
const userFactory = require("./../user/factory");
const nodemailerMock = require("nodemailer-mock");

// const { jwt, grantPrivilage } = require("./../helpers/strapi");
describe("Reset password", () => {
  let user;

  beforeAll(async (done) => {
    user = await userFactory.createUser(strapi);
    // await grantPrivilage(1, "permissions.application.controllers.hello.hi");
    done();
  });

  it("should reset password, send email with link, link should change password", async (done) => {
    const newPassword = "newPassword";
    // 1. send emil to forgot password

    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/forgot-password")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({ email: user.email })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.ok).toBe(true);
      });

    const emailsSent = nodemailerMock.mock.getSentMail();
    // at least one email should be sent now
    expect(emailsSent.length).toBeGreaterThan(0);

    // one of the emails should contain the token for changing password
    const confirmRegEx = /\A?code=[^&|\s|<|"]+&*/g;
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

    // 2. the code with new passoword on /auth/reset-password

    const code = confirmationLink.split("=")[1];

    expect(code).toBeDefined();

    // 3. change password

    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/reset-password")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        password: newPassword,
        passwordConfirmation: newPassword,
        code: code,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.jwt).toBeDefined();
        expect(response.body.user.username).toBe(user.username);
        expect(response.body.user.email).toBe(user.email);
      });

    // 4. test if password has changed

    await request(strapi.server) // app server is and instance of Class: http.Server
      .post("/auth/local")
      .set("accept", "application/json")
      .set("Content-Type", "application/json")
      .send({
        identifier: user.email,
        password: newPassword,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.jwt).toBeDefined();
        expect(response.body.user.username).toBe(user.username);
        expect(response.body.user.email).toBe(user.email);
      });

    done();
  });
});
