import { NextResponse } from "next/server";

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return json({ error: message, details }, { status: 400 });
}

export function notFound(message = "Not found") {
  return json({ error: message }, { status: 404 });
}

export function serverError(message = "Internal server error") {
  return json({ error: message }, { status: 500 });
}

