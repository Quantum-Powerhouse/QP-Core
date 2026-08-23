import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy to the FastAPI backend's hardware lane. When the backend URL isn't
 * configured, say so in a structured way — the page renders an honest
 * "wired but inactive" state instead of a fake result.
 */
const BACKEND = process.env.NEXT_PUBLIC_TRANSPILER_API_URL?.replace(/\/$/, "");

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  if (!BACKEND) {
    return NextResponse.json({ configured: false, backendConfigured: false, note: "No backend URL is configured on this deployment (NEXT_PUBLIC_TRANSPILER_API_URL). The hardware lane is built and tested; it activates when the FastAPI service is deployed with an IBM Quantum token." });
  }
  const upstream = await fetch(`${BACKEND}/api/v1/hardware/${path.join("/")}`, { cache: "no-store" });
  const body = await upstream.json().catch(() => ({}));
  return NextResponse.json({ backendConfigured: true, ...body }, { status: upstream.status });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  if (!BACKEND) {
    return NextResponse.json({ configured: false, backendConfigured: false, detail: "hardware execution not configured on this deployment" }, { status: 503 });
  }
  const payload = await req.text();
  const upstream = await fetch(`${BACKEND}/api/v1/hardware/${path.join("/")}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    cache: "no-store",
  });
  const body = await upstream.json().catch(() => ({}));
  return NextResponse.json({ backendConfigured: true, ...body }, { status: upstream.status });
}
