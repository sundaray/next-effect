import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(undefined as any, {
    provider: "pg",
    usePlural: true,
  }),

  socialProviders: {
    google: {
      clientId: "placeholder",
      clientSecret: "placeholder",
    },
  },

  plugins: [
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {},
    }),
  ],

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
      submissionCount: {
        type: "number",
        required: true,
        defaultValue: 0,
        input: false,
      },
    },
  },
});
