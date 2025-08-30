import { Hono } from "hono";
import { z } from "zod";
import { Effect, Data, pipe } from "effect";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import { tools, toolHistory, users } from "@/db/schema";
import { sendSubmissionUpdateEmail } from "@/lib/send-submission-update-email";
import { eq } from "drizzle-orm";
import type { AuthType } from "@/lib/services/auth-service";
import { zValidator } from "@hono/zod-validator";

const rejectSchema = z.object({
  reason: z.string().min(1, { message: "Reason for rejection is required." }),
});

class ToolNotFoundError extends Data.TaggedError("ToolNotFoundError") {}
class SubmitterEmailNotFoundError extends Data.TaggedError(
  "SubmitterEmailNotFoundError"
) {}

class ApprovalSimulationError extends Data.TaggedError(
  "ApprovalSimulationError"
)<{
  message: string;
}> {}

const app = new Hono<{
  Variables: AuthType;
}>()

  // -----------------------------------------------

  //  POST /submissions/:id/approve

  // -----------------------------------------------

  .post("/submissions/:id/approve", async (ctx) => {
    const toolId = ctx.req.param("id");
    const admin = ctx.get("user");

    const program = Effect.gen(function* () {
      const dbService = yield* DatabaseService;
      const [toolDetails] = yield* dbService.use((db) =>
        db
          .select({
            name: tools.name,
            slug: tools.slug,
            submittedByEmail: users.email,
          })
          .from(tools)
          .leftJoin(users, eq(tools.submittedBy, users.id))
          .where(eq(tools.id, toolId))
          .limit(1)
      );
      if (!toolDetails) return yield* Effect.fail(new ToolNotFoundError());
      if (!toolDetails.submittedByEmail)
        return yield* Effect.fail(new SubmitterEmailNotFoundError());
      yield* dbService.use((db) =>
        db
          .update(tools)
          .set({ adminApprovalStatus: "approved", approvedAt: new Date() })
          .where(eq(tools.id, toolId))
      );
      yield* dbService.use((db) =>
        db.insert(toolHistory).values({
          toolId: toolId,
          userId: admin!.id,
          eventType: "approved",
        })
      );
      yield* sendSubmissionUpdateEmail({
        type: "approval",
        to: toolDetails.submittedByEmail,
        appName: toolDetails.name,
        slug: toolDetails.slug,
      });
      return ctx.json({ success: true });
    });

    const handledProgram = pipe(
      program,
      Effect.catchTag("ToolNotFoundError", () =>
        Effect.succeed(
          ctx.json(
            {
              _tag: "ToolNotFoundError",
              message: "The submission could not be found. Please try again.",
            },
            { status: 404 }
          )
        )
      ),
      Effect.catchTag("SubmitterEmailNotFoundError", () =>
        Effect.succeed(
          ctx.json(
            {
              _tag: "SubmitterEmailNotFoundError",
              message:
                "Could not find the email of the user who submitted this app.",
            },
            { status: 404 }
          )
        )
      ),
      Effect.catchAll(() =>
        Effect.succeed(
          ctx.json(
            {
              _tag: "InternalServerError",
              message: "An unexpected server error occurred. Please try again.",
            },
            { status: 500 }
          )
        )
      ),
      Effect.ensureErrorType<never>()
    );

    return await serverRuntime.runPromise(handledProgram);
  })

  // -----------------------------------------------

  //  POST /submissions/:id/reject

  // -----------------------------------------------

  .post(
    "/submissions/:id/reject",
    zValidator("json", rejectSchema),
    async (ctx) => {
      const toolId = ctx.req.param("id");
      const { reason } = await ctx.req.json();
      const admin = ctx.get("user");

      if (!reason || typeof reason !== "string" || reason.trim() === "") {
        return ctx.json({ error: "Reason for rejection is required." }, 400);
      }

      const program = Effect.gen(function* () {
        const dbService = yield* DatabaseService;

        const [toolDetails] = yield* dbService.use((db) =>
          db
            .select({
              name: tools.name,
              submittedByEmail: users.email,
            })
            .from(tools)
            .leftJoin(users, eq(tools.submittedBy, users.id))
            .where(eq(tools.id, toolId))
            .limit(1)
        );

        if (!toolDetails) return yield* Effect.fail(new ToolNotFoundError());
        if (!toolDetails.submittedByEmail)
          return yield* Effect.fail(new SubmitterEmailNotFoundError());

        yield* dbService.use((db) =>
          db
            .update(tools)
            .set({ adminApprovalStatus: "rejected" })
            .where(eq(tools.id, toolId))
        );
        yield* dbService.use((db) =>
          db.insert(toolHistory).values({
            toolId: toolId,
            userId: admin!.id,
            eventType: "rejected",
            reason: reason,
          })
        );
        yield* sendSubmissionUpdateEmail({
          type: "rejection",
          to: toolDetails.submittedByEmail,
          appName: toolDetails.name,
          reason: reason,
        });

        return ctx.json({ success: true });
      });
      const handledProgram = pipe(
        program,
        Effect.catchTag("ToolNotFoundError", () =>
          Effect.succeed(
            ctx.json(
              {
                _tag: "ToolNotFoundError",
                message: "The submission could not be found. Please try again.",
              },
              { status: 404 }
            )
          )
        ),
        Effect.catchTag("SubmitterEmailNotFoundError", () =>
          Effect.succeed(
            ctx.json(
              {
                _tag: "SubmitterEmailNotFoundError",
                message:
                  "Could not find the email of the user who submitted this app.",
              },
              { status: 404 }
            )
          )
        ),
        Effect.catchAll(() =>
          Effect.succeed(
            ctx.json(
              {
                _tag: "InternalServerError",
                message:
                  "An unexpected server error occurred. Please try again.",
              },
              { status: 500 }
            )
          )
        ),
        Effect.ensureErrorType<never>()
      );

      return await serverRuntime.runPromise(handledProgram);
    }
  );

export default app;
