import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { ensurePlayerProfile, getCreaturesForPlayer, saveCreatureForPlayer } from "./db";

const creatureInput = z.object({
  id: z.string().min(3).max(48),
  name: z.string().min(1).max(64),
  family: z.string().min(1).max(32),
  generatorVersion: z.string().min(1).max(24),
  seed: z.string().min(1).max(24),
  dna: z.string().min(8),
  genomeJson: z.string().min(2),
  scoreJson: z.string().min(2),
  rarity: z.enum(["common", "uncommon", "rare", "extreme", "anomalous", "singular"]),
  rarityReason: z.string().min(1),
  parentIdsJson: z.string().min(2),
  generation: z.number().int().min(0),
  previewKey: z.string().max(512).nullable().optional(),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  player: router({
    mine: protectedProcedure.query(({ ctx }) => ensurePlayerProfile(ctx.user.id, ctx.user.name)),
  }),
  creature: router({
    mine: protectedProcedure.query(({ ctx }) => getCreaturesForPlayer(ctx.user.id)),
    save: protectedProcedure.input(creatureInput).mutation(({ ctx, input }) => saveCreatureForPlayer(ctx.user.id, input)),
  }),
});

export type AppRouter = typeof appRouter;
