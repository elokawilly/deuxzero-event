import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedActions = new Set(["lookup", "register", "balance"]);

export async function POST(request) {
  try {
    const url = process.env.GAS_WEB_APP_URL;
    const secret = process.env.GAS_API_SECRET;

    if (!url || !secret) {
      console.error("Missing GAS_WEB_APP_URL or GAS_API_SECRET");
      return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 });
    }

    if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) {
      console.error("Invalid GAS_WEB_APP_URL");
      return NextResponse.json({ error: "Configuration du service invalide." }, { status: 503 });
    }

    const raw = await request.text();
    if (raw.length > 8192) {
      return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
    }
    let body;
    try { body = JSON.parse(raw); } catch {
      return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Format de requête invalide." }, { status: 400 });
    }
    const { action, ...payload } = body;
    if (typeof action !== "string" || !allowedActions.has(action)) {
      return NextResponse.json({ error: "Action non autorisée." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let upstream;
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, ...payload, apiSecret: secret }),
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      console.error("Apps Script returned status", upstream.status);
      return NextResponse.json({ error: "Impossible de contacter le service de cotisations." }, { status: 502 });
    }
    const responseText = await upstream.text();
    let result;
    try { result = JSON.parse(responseText); } catch {
      console.error("Apps Script returned non-JSON response");
      return NextResponse.json({ error: "Réponse invalide du service de cotisations." }, { status: 502 });
    }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return NextResponse.json({ error: "Réponse invalide du service de cotisations." }, { status: 502 });
    }
    return NextResponse.json(result, {
      status: result.ok === false ? 400 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Cotisations API error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Erreur temporaire. Réessaie plus tard." }, { status: 500 });
  }
}
