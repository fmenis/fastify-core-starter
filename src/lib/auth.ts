import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { kysely as db } from "./kysely.js";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: { db, type: "postgres" },
  trustedOrigins: [process.env.FRONTEND_ORIGIN!],
  emailAndPassword: { enabled: true },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  databaseHooks: {
    user: {
      create: {
        after: async user => {
          console.log("ciao");
          await db
            .insertInto("profile")
            .values({ userId: user.id })
            .executeTakeFirstOrThrow();
          console.log("ciao2");
        },
      },
    },
  },

  advanced: {
    database: { generateId: "uuid" },
    crossSubDomainCookies: process.env.COOKIE_DOMAIN
      ? { enabled: true, domain: process.env.COOKIE_DOMAIN }
      : { enabled: false },
  },

  plugins: [
    jwt({
      jwt: {
        expirationTime: "15m",
        definePayload: ({ user }) => ({ id: user.id, email: user.email }),
      },
      jwks: { keyPairConfig: { alg: "EdDSA" } },
    }),
  ],
});
