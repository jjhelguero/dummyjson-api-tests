const { spec, request } = require("pactum");

request.setBaseUrl("https://dummyjson.com");
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

it("should log in with a response with status code 200", async () => {
  await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .expectStatus(200);
});

it("should have token in response", async () => {
  await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .expect((ctx) => {
      expect(ctx.res.body).toHaveProperty("token");
    });
});
