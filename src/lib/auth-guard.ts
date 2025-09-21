import { NextResponse } from "next/server";
import { auth0 } from "./auth0";

export async function requireSession() {
  const session = await auth0.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { session } as const;
}
