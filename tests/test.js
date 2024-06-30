const { spec, request } = require("pactum");

request.setBaseUrl("https://dummyjson.com");

it("should get a response with status code 200", async () => {
  const username = process.env.admin_username;
  const password = process.env.admin_password;

  await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .expectStatus(200);
});
