const request = require("supertest");
const userFactory = require("./../user/factory");
const { jwt, grantPrivilege } = require("./../helpers/strapi");
describe("Hello methods", () => {
  let user;

  beforeAll(async () => {
    user = await userFactory.createUser(strapi);
    await grantPrivilege(1, "permissions.application.controllers.hello.hi"); // 1 is default role for new confirmed users
  });

  it("should return hello world", async () => {
    await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/hello")
      .expect(200) // Expect response http code 200
      .then((data) => {
        expect(data.text).toBe("Hello World!"); // expect the response text
      });
  });

  it("should return 403 error", async () => {
    await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/hi")
      .expect(403) // Expect response http code 403
      .then((data) => {
        expect(data.body.error).toBe("Forbidden"); // expect the response error
      });
  });

  it("should return `Hi ${user.username}`", async () => {
    const token = await jwt(user.id);
    await request(strapi.server) // app server is and instance of Class: http.Server
      .get("/hi")
      .set("Authorization", "Bearer " + token)
      .expect(200) // Expect response http code 200
      .then((data) => {
        expect(data.text).toBe(`Hi ${user.username}`); // expect the response welcome text
      });
  });
});
