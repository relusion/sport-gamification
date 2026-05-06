import { describe, it, expect } from "vitest";

import { GET, dynamic } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns HTTP 200", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
  });

  it("returns JSON body { status: 'ok' }", async () => {
    const response = await GET();
    const body = (await response.json()) as { status: string };

    expect(body).toEqual({ status: "ok" });
  });

  it("sets Content-Type to application/json", async () => {
    const response = await GET();

    expect(response.headers.get("content-type")).toMatch(/application\/json/);
  });

  it("forces dynamic rendering so it cannot be statically cached", () => {
    expect(dynamic).toBe("force-dynamic");
  });
});
