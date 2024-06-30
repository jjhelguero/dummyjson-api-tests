const { spec, request } = require("pactum");

request.setBaseUrl("https://dummyjson.com");
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

it("should log in with a response with status code 200", async () => {
  await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .expectStatus(200, "OK");
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

it("should have get current auth user", async () => {
  const token = await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .returns("token");

  await spec()
    .get("/auth/me")
    .withHeaders("Authorization", `Bearer ${token}`)
    .expectStatus(200, "OK");
});

it("should refresh auth session", async () => {
  const refreshToken = await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .returns("refreshToken");
  await spec()
    .post("/auth/refresh")
    .withHeaders("Content-Type", "application/json")
    .withJson({ refreshToken })
    .expectStatus(200, "OK");
});

it("should get current auth user auth with refreshed token", async () => {
  const { token, refreshToken } = await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .returns((ctx) => {
      return {
        toke: ctx.res.body.token,
        refreshToken: ctx.res.body.refreshToken,
      };
    });
  const newToken = await spec()
    .post("/auth/refresh")
    .withHeaders("Content-Type", "application/json")
    .withJson({ refreshToken })
    .returns("token");

  await spec()
    .get("/auth/me")
    .withHeaders("Authorization", `Bearer ${newToken}`)
    .expectStatus(200, "OK");
});

it("should not get current auth user with old token", async () => {
  const { token, refreshToken } = await spec()
    .post("/auth/login")
    .withHeaders("Content-Type", "application/json")
    .withJson({ username, password })
    .returns((ctx) => {
      return {
        toke: ctx.res.body.token,
        refreshToken: ctx.res.body.refreshToken,
      };
    });

  await spec()
    .post("/auth/refresh")
    .withHeaders("Content-Type", "application/json")
    .withJson({ refreshToken });

  await spec()
    .get("/auth/me")
    .withHeaders("Authorization", `Bearer ${token}`)
    .expectStatus(401, "Unauthorized");
});
