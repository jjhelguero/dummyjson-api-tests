const { spec, request } = require("pactum");

request.setBaseUrl("https://dummyjson.com");

it("should get a response with status code 200", async () => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .expectStatus(200);
});
