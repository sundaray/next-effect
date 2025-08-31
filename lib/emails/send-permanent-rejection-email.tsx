import "server-only";
import React from "react";
import { Effect, Config, Data } from "effect";
import { render } from "@react-email/render";
import { EmailService } from "@/lib/services/email-service";
import { SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import { PermanentRejectionEmailTemplate } from "@/components/emails/permanent-rejection-email-template";

class EmailTemplateRenderError extends Data.TaggedError(
  "EmailTemplateRenderError"
)<{ cause: unknown }> {}

type SendPermanentRejectionEmailParams = {
  to: string;
  appName: string;
  reason: string;
};

export function sendPermanentRejectionEmail(
  params: SendPermanentRejectionEmailParams
) {
  return Effect.gen(function* () {
    const emailService = yield* EmailService;
    const emailFrom = yield* Config.string("EMAIL_FROM");

    const emailHtml = yield* Effect.tryPromise({
      try: () =>
        render(
          <PermanentRejectionEmailTemplate
            appName={params.appName}
            reason={params.reason}
          />
        ),
      catch: (error) => new EmailTemplateRenderError({ cause: error }),
    });

    const emailInput: SendEmailCommandInput = {
      Destination: { ToAddresses: [params.to] },
      Message: {
        Body: { Html: { Charset: "UTF-8", Data: emailHtml } },
        Subject: {
          Charset: "UTF-8",
          Data: `Final Decision on Your App Submission: ${params.appName}`,
        },
      },
      Source: emailFrom,
    };

    const command = new SendEmailCommand(emailInput);
    yield* emailService.use((client) => client.send(command));
  }).pipe(Effect.tapError((error) => Effect.logError(error)));
}
