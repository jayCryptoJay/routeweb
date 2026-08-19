import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { makeRequest, type DirectionsResult, type GeocodingResult } from "./_core/map";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getDeliveryStop,
  getRouteSummary,
  getUnlocatedStops,
  listDeliveryStops,
  updateCoordinates,
  updateDeliveryDetails,
  updateDeliveryStatus
} from "./db";

const idInput = z.object({ id: z.number().int().positive() });
const statusInput = z.object({
  status: z.enum(["pending", "completed", "skipped"]).optional(),
});

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim();
}

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  admin: router({
    extractRouteFromImage: protectedProcedure
      .input(z.object({ imageBase64: z.string(), mimeType: z.string(), routeId: z.string() }))
      .mutation(async ({ input }) => {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      data: input.imageBase64,
                      mimeType: input.mimeType,
                    },
                  },
                  {
                    text: `Extract the delivery route stops from this image.
Return a JSON array of objects, where each object has:
- sequenceNumber (integer, the order of the stop)
- address (string, full street address including city/state if available)
- municipality (string, city name)
- roadLabel (string, just the street name)

Ensure it's a valid JSON array and nothing else. Do not use markdown blocks.`,
                  },
                ],
              },
            ],
            config: {
              responseMimeType: "application/json",
            },
          });

          const jsonText = response.text || "[]";
          const stops = JSON.parse(jsonText);

          const db = await import("./db").then(m => m.getDb());
          if (!db) throw new Error("Database not connected");
          
          const { deliveryStops } = await import("../drizzle/schema");

          if (stops && stops.length > 0) {
            await db.insert(deliveryStops).values(
              stops.map((stop: any) => ({
                sequenceNumber: stop.sequenceNumber,
                address: stop.address,
                municipality: stop.municipality || "Unknown",
                roadLabel: stop.roadLabel || "Unknown",
                status: "pending",
                routeId: input.routeId,
              }))
            );
          }

          return { success: true, count: stops.length };
        } catch (error: any) {
          console.error("Failed to extract route from image", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
        }
      }),
  }),

  mobile: router({
    route: protectedProcedure.input(z.object({ routeId: z.string().optional() }).optional()).query(async ({ input }) => {
      const routeId = input?.routeId;
      const stops = await listDeliveryStops(undefined, routeId);
      const summary = await getRouteSummary(routeId);
      return { summary, stops };
    }),
    complete: protectedProcedure.input(idInput.extend({ routeId: z.string().optional() })).mutation(async ({ input }) => {
      await updateDeliveryStatus(input.id, "completed");
      const summary = await getRouteSummary(input.routeId);
      const stops = await listDeliveryStops(undefined, input.routeId);
      return { summary, stops };
    }),
    skip: protectedProcedure.input(idInput.extend({ routeId: z.string().optional() })).mutation(async ({ input }) => {
      await updateDeliveryStatus(input.id, "skipped");
      const summary = await getRouteSummary(input.routeId);
      const stops = await listDeliveryStops(undefined, input.routeId);
      return { summary, stops };
    }),
  }),

  delivery: router({
    list: protectedProcedure.input(statusInput.extend({ routeId: z.string().optional() })).query(({ input }) => listDeliveryStops(input.status, input.routeId)),

    get: protectedProcedure.input(idInput).query(({ input }) => getDeliveryStop(input.id)),

    summary: protectedProcedure.input(z.object({ routeId: z.string().optional() }).optional()).query(({ input }) => getRouteSummary(input?.routeId)),

    complete: protectedProcedure.input(idInput).mutation(({ input }) => updateDeliveryStatus(input.id, "completed")),

    skip: protectedProcedure.input(idInput).mutation(({ input }) => updateDeliveryStatus(input.id, "skipped")),

    reset: protectedProcedure.input(idInput).mutation(({ input }) => updateDeliveryStatus(input.id, "pending")),

    updateDetails: protectedProcedure.input(
      idInput.extend({
        notes: z.string().nullable().optional(),
        specialRequest: z.string().nullable().optional(),
        publicationType: z.string().optional(),
        lat: z.number().nullable().optional(),
        lng: z.number().nullable().optional(),
        lotOrUnit: z.string().nullable().optional(),
        complexName: z.string().nullable().optional(),
        gateCode: z.string().nullable().optional(),
        pinNotes: z.string().nullable().optional(),
        isExactPin: z.number().nullable().optional(),
      }),
    ).mutation(({ input }) => updateDeliveryDetails(input.id, {
      notes: input.notes,
      specialRequest: input.specialRequest,
      publicationType: input.publicationType,
      lat: input.lat,
      lng: input.lng,
      lotOrUnit: input.lotOrUnit,
      complexName: input.complexName,
      gateCode: input.gateCode,
      pinNotes: input.pinNotes,
      isExactPin: input.isExactPin,
    })),

    /**
     * Delivery sequencing is supplied as a fixed newspaper route. This endpoint
     * intentionally remains non-mutating for backwards-compatible clients.
     */
    optimizeRoute: protectedProcedure.input(
      z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        routeId: z.string().optional(),
      }),
    ).mutation(() => ({
      success: false,
      message: "Route order is locked to the published newspaper sequence.",
    })),

    geocodeRoute: protectedProcedure.input(z.object({ routeId: z.string().optional() }).optional()).mutation(async ({ input }) => {
      const routeId = input?.routeId;
      const allStops = await listDeliveryStops(undefined, routeId);
      const unlocated = await getUnlocatedStops(routeId);
      let geocoded = 0;
      let notFound = 0;
      let failed = 0;

      for (let index = 0; index < unlocated.length; index += 6) {
        const batch = unlocated.slice(index, index + 6);
        await Promise.all(batch.map(async stop => {
          try {
            const result = await makeRequest<GeocodingResult>("/maps/api/geocode/json", { address: stop.address });
            const location = result.results?.[0]?.geometry?.location;
            if (result.status === "OK" && location) {
              await updateCoordinates(stop.id, location.lat, location.lng);
              geocoded += 1;
            } else {
              notFound += 1;
            }
          } catch (error) {
            console.warn(`[Maps] Geocoding failed for stop ${stop.sequenceNumber}`, error);
            failed += 1;
          }
        }));
      }

      return {
        total: allStops.length,
        attempted: unlocated.length,
        alreadyGeocoded: allStops.length - unlocated.length,
        geocoded,
        notFound,
        failed,
      };
    }),

    directions: protectedProcedure.input(
      z.object({ origin: z.string().min(1), destination: z.string().min(1) }),
    ).query(async ({ input }) => {
      const result = await makeRequest<DirectionsResult>("/maps/api/directions/json", {
        origin: input.origin,
        destination: input.destination,
        mode: "driving",
        alternatives: false,
      });
      const route = result.routes?.[0];
      if (result.status !== "OK" || !route) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Directions were not available for this stop." });
      }
      const leg = route.legs?.[0];
      if (!leg) throw new TRPCError({ code: "BAD_REQUEST", message: "No driving route was returned." });
      return {
        summary: route.summary,
        distance: leg.distance,
        duration: leg.duration,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        polyline: route.overview_polyline?.points ?? "",
        steps: leg.steps.map((step, index) => ({
          index: index + 1,
          instruction: stripHtml(step.html_instructions),
          distance: step.distance.text,
          duration: step.duration.text,
          travelMode: step.travel_mode,
        })),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
