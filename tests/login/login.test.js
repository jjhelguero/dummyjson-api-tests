const { spec, request } = require("pactum");
const Ajv = require("ajv");

request.setBaseUrl("https://dummyjson.com");
const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

describe("/auth/login", () => {
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
});

describe("/auth/me", () => {
  let token = "";
  let refreshToken = "";

  beforeEach(async () => {
    const { t, r } = await spec()
      .post("/auth/login")
      .withHeaders("Content-Type", "application/json")
      .withJson({ username, password })
      .returns((ctx) => {
        return {
          t: ctx.res.body.token,
          r: ctx.res.body.refreshToken,
        };
      });

    token = t;
    refreshToken = r;
  });

  it("should have get current auth user", async () => {
    await spec()
      .get("/auth/me")
      .withHeaders("Authorization", `Bearer ${token}`)
      .expectStatus(200, "OK");
  });

  it("should refresh auth session", async () => {
    await spec()
      .post("/auth/refresh")
      .withHeaders("Content-Type", "application/json")
      .withJson({ refreshToken })
      .expectStatus(200, "OK");
  });
});

describe("/auth/refresh", () => {
  let token = "";
  let refreshToken = "";

  beforeEach(async () => {
    const { t, r } = await spec()
      .post("/auth/login")
      .withHeaders("Content-Type", "application/json")
      .withJson({ username, password, expiresInMins: 1 })
      .returns((ctx) => {
        return {
          t: ctx.res.body.token,
          r: ctx.res.body.refreshToken,
        };
      });

    token = t;
    refreshToken = r;
  });

  it("should get current auth user auth with refreshed token", async () => {
    const newToken = await spec()
      .post("/auth/refresh")
      .withHeaders("Content-Type", "application/json")
      .withJson({ refreshToken })
      .returns("token");

    await spec()
      .get("/auth/me")
      .withHeaders("Authorization", `Bearer ${newToken}`)
      .expect((ctx) => {
        const res = ctx.res;
        expect(res.statusCode).toBe(200);
        expect(res.statusMessage).toBe("OK");
        expect(token).not.toBe(newToken);
      });
  });

  it.skip("should not get current auth user with old token", async () => {
    await spec()
      .post("/auth/refresh")
      .withHeaders("Content-Type", "application/json")
      .withJson({ refreshToken });

    await spec()
      .get("/auth/me")
      .withHeaders("Authorization", `Bearer ${token}`)
      .expectStatus(401, "Unauthorized");
  });
});
