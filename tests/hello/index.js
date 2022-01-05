const { describe, it, expect, beforeAll } = require('@jest/globals');
const request = require("supertest");
const { createUser } = require("./../user/factory");
const { jwt, grantPrivilege } = require("./../helpers/strapi");

describe("Hello methods", () => {
  let user;

  beforeAll(async () => {
    user = await createUser();
    await grantPrivilege(1, "permissions.application.controllers.hello.hi"); // 1 is default role for new confirmed users
  });

  it("should return hello world", async () => {
    const response = await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/hello");

    expect(response.status).toBe(200); // expect response http code 200
    expect(response.text).toBe("Hello World!"); // expect the response text
  });

  it("should return 403 error", async () => {
    const response = await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/hi");

    expect(response.body.error).toBe("Forbidden"); // expect the response error
    expect(response.status).toBe(403); // expect response http code 403
  });

  it("should return 'Hi $username'", async () => {
    const response = await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/hi")
      .set("Authorization", `Bearer ${jwt(user.id)}`);

    expect(response.status).toBe(200); // expect response http code 200
    expect(response.text).toBe(`Hi ${user.username}`); // expect the response welcome text
  });
});
