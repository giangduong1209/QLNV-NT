import { NextResponse } from "next/server";

export function handleError(message: string, status: number = 500) {
  console.error(`[API Error ${status}]:`, message);
  return NextResponse.json({ error: message }, { status });
}
