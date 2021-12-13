const { describe, it, expect, beforeAll } = require('@jest/globals');
const request = require("supertest");
const { createUser } = require("../user/factory");
const { jwt, grantPrivilege } = require("../helpers/strapi");

describe("Todo-list methods", () => {
  let user;

  beforeAll(async () => {
    user = await createUser();
    await grantPrivilege(1, "permissions.application.controllers[\'todo-list\'].find"); // 1 is default role for new confirmed users
  });

  it("should return a list of todos", async () => {
    const response = await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/todo-lists")
      .set('Authorization', `Bearer ${jwt(user.id)}`);

    expect(response.body).toStrictEqual([]); // expect the response text
    expect(response.status).toBe(200); // expect response http code 200
  });
});
