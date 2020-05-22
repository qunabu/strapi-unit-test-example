const request = require("supertest");

it("should return hello world", async (done) => {
  await request(strapi.server) // app server is and instance of Class: http.Server
    .get("/hello")
    .expect(200) // Expect response http code 200
    .then((data) => {
      expect(data.text).toBe("Hello World!"); // expect the response text
    });
  done();
});
