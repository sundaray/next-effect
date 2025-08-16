import { Effect, Config, Redacted } from "effect";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DbClientService } from "@/lib/services/dbClient-service";

const adminEmailsConfig = Config.array(Config.string(), "ADMIN_EMAILS").pipe(
  Config.map((emails) => emails.map((email) => email.trim().toLowerCase()))
);

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

    const adminEmails = yield* adminEmailsConfig;

    const googleClientId = Redacted.value(
      yield* Config.redacted("GOOGLE_CLIENT_ID")
    );
    const googleClientSecret = Redacted.value(
      yield* Config.redacted("GOOGLE_CLIENT_SECRET")
    );

    const auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg", usePlural: true }),
      socialProviders: {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          mapProfileToUser: (profile) => {
            return {
              firstName: profile.given_name,
              lastName: profile.family_name,
            };
          },
        },
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            required: true,
            defaultValue: "user",
            input: false,
          },
          firstName: {
            type: "string",
            required: false,
          },
          lastName: {
            type: "string",
            required: false,
          },
        },
      },
      databaseHooks: {
        user: {
          create: {
            before: async (user) => {
              const normalizedUserEmail = user.email.trim().toLowerCase();
              const role = adminEmails.includes(normalizedUserEmail)
                ? "admin"
                : "user";
              return {
                data: {
                  ...user,
                  role,
                },
              };
            },
          },
        },
      },
    });
    return auth;
  }),
  dependencies: [DbClientService.Default],
}) {}

export type AuthType = {
  user: typeof AuthService.Service.$Infer.Session.user | null;
  session: typeof AuthService.Service.$Infer.Session.session | null;
};
