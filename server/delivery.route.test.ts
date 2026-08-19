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

function authenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "route-driver",
      name: "Route Driver",
      email: "driver@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("locked newspaper route", () => {
  it("contains all 162 stops in contiguous published sequence order", () => {
    expect(ROUTE_STOPS).toHaveLength(162);
    expect(ROUTE_STOPS[0]).toMatchObject({ sequenceNumber: 1, address: "1342 Rosery Rd NE, Largo, FL" });
    expect(ROUTE_STOPS[161]).toMatchObject({ sequenceNumber: 162, address: "202 Palm Dr, Belleair Bluffs, FL" });
    expect(ROUTE_STOPS.map(stop => stop.sequenceNumber)).toEqual(Array.from({ length: 162 }, (_, index) => index + 1));
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

  it("does not reorder the fixed newspaper route", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    await expect(caller.delivery.optimizeRoute({ routeId: "default" })).resolves.toEqual({
      success: false,
      message: "Route order is locked to the published newspaper sequence.",
    });
    expect(ROUTE_STOPS.map(stop => stop.sequenceNumber)).toEqual(Array.from({ length: 162 }, (_, index) => index + 1));
  });
});
