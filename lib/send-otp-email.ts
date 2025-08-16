import "server-only";

import { Effect, Config, Data } from "effect";
import { render } from "@react-email/render";
import { EmailService } from "@/lib/services/email-service";
import { EmailOtpTemplate } from "@/components/email-otp-template";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError"
)<{ operation: string; cause: unknown }> {}

export function sendSignInOtpEmail(email: string, otp: string) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;
    const emailFrom = yield* Config.string("EMAIL_FROM");

    const emailHtml = yield* Effect.tryPromise({
      try: async () => await render(EmailOtpTemplate(otp)),
      catch: (error) =>
        new EmailTemplateRenderError({
          operation: "sendSignInOtpEmail",
          cause: error,
        }),
    });

    const emailInput: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: emailHtml,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Your sign-in OTP",
        },
      },
      Source: emailFrom,
    };

    const command = new SendEmailCommand(emailInput);

    yield* emailService.use((client) => client.send(command));
  }).pipe(
    Effect.tapErrorTag("ConfigError", (error) => Effect.logError(error)),
    Effect.tapErrorTag("EmailError", (error) =>
      Effect.logError({ error, operation: "sendSignInOtpEmail" })
    ),
    Effect.tapErrorTag("EmailTemplateRenderError", (error) =>
      Effect.logError(error)
    )
  );
}
