import { describe, expect, it } from "vitest";
import { ROUTE_STOPS } from "../shared/route-data";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("locked newspaper route", () => {
  it("contains all 190 stops in contiguous sequence order", () => {
    expect(ROUTE_STOPS).toHaveLength(190);
    expect(ROUTE_STOPS[0]).toMatchObject({ sequenceNumber: 1, address: "1342 Rosery Rd NE, Belleair Bluffs, FL" });
    expect(ROUTE_STOPS[189]).toMatchObject({ sequenceNumber: 190, address: "211 Live Oak Ln, Belleair Bluffs, FL" });
    expect(ROUTE_STOPS.map(stop => stop.sequenceNumber)).toEqual(Array.from({ length: 190 }, (_, index) => index + 1));
  });

  it("keeps both route municipalities available for location context", () => {
    expect(new Set(ROUTE_STOPS.map(stop => stop.municipality))).toEqual(new Set(["Belleair Bluffs", "Largo"]));
  });
});

describe("delivery protection", () => {
  it("requires authentication before exposing route summary", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.delivery.summary()).rejects.toThrow("Please login");
  });
});
