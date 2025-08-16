import { Effect, Config, Redacted } from "effect";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DbClientService } from "@/lib/services/dbClient-service";

export class AuthService extends Effect.Service<AuthService>()("AuthService", {
  effect: Effect.gen(function* () {
    const db = yield* DbClientService;

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
