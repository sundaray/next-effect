import { Hono } from "hono";
import { z } from "zod";
import { Effect, Data, pipe } from "effect";
import { serverRuntime } from "@/lib/server-runtime";
import { DatabaseService } from "@/lib/services/database-service";
import { tools, toolHistory, users } from "@/db/schema";
import { sendApprovalEmail } from "@/lib/emails/send-approval-email";
import { sendRejectionEmail } from "@/lib/emails/send-rejection-email";
import { sendPermanentRejectionEmail } from "@/lib/emails/send-permanent-rejection-email";
import { eq, sql } from "drizzle-orm";
import type { AuthType } from "@/lib/services/auth-service";
import { zValidator } from "@hono/zod-validator";
import { APP_RESUBMISSION_LIMIT } from "@/config/limit";

const rejectSchema = z.object({
  reason: z.string().min(1, { message: "Reason for rejection is required." }),
});

class ToolNotFoundError extends Data.TaggedError("ToolNotFoundError") {}
class SubmitterEmailNotFoundError extends Data.TaggedError(
  "SubmitterEmailNotFoundError"
) {}

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
          .set({
            adminApprovalStatus: "approved",
            approvedAt: new Date(),
            rejectionCount: 0,
          })
          .where(eq(tools.id, toolId))
      );
      yield* dbService.use((db) =>
        db.insert(toolHistory).values({
          toolId: toolId,
          userId: admin!.id,
          eventType: "approved",
        })
      );
      yield* sendApprovalEmail({
        to: toolDetails.submittedByEmail,
        appName: toolDetails.name,
        slug: toolDetails.slug,
      });
      return ctx.json({ success: true });
    });

    const handledProgram = pipe(
      program,
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
              rejectionCount: tools.rejectionCount,
            })
            .from(tools)
            .leftJoin(users, eq(tools.submittedBy, users.id))
            .where(eq(tools.id, toolId))
            .limit(1)
        );

        if (!toolDetails) return yield* Effect.fail(new ToolNotFoundError());
        if (!toolDetails.submittedByEmail)
          return yield* Effect.fail(new SubmitterEmailNotFoundError());

        const isFinalRejection =
          toolDetails.rejectionCount >= APP_RESUBMISSION_LIMIT;

        if (isFinalRejection) {
          // Permanently reject the tool
          yield* dbService.use((db) =>
            db
              .update(tools)
              .set({ adminApprovalStatus: "permanently_rejected" })
              .where(eq(tools.id, toolId))
          );
          // Send the permanent rejection email
          yield* sendPermanentRejectionEmail({
            to: toolDetails.submittedByEmail,
            appName: toolDetails.name,
            reason: reason,
          });
        } else {
          // Normal rejection: increment count and set status
          yield* dbService.use((db) =>
            db
              .update(tools)
              .set({
                adminApprovalStatus: "rejected",
                rejectionCount: sql`${tools.rejectionCount} + 1`,
              })
              .where(eq(tools.id, toolId))
          );
          // Send the standard rejection email
          yield* sendRejectionEmail({
            to: toolDetails.submittedByEmail,
            appName: toolDetails.name,
            reason: reason,
          });
        }
        yield* dbService.use((db) =>
          db.insert(toolHistory).values({
            toolId: toolId,
            userId: admin!.id,
            eventType: "rejected",
            reason: reason,
          })
        );

        return ctx.json({ success: true });
      });
      const handledProgram = pipe(
        program,
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
