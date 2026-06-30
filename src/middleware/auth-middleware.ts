import { NextRequest, NextResponse } from "next/server";

import { verifyAuthToken } from "@/lib/jwt";

export type AuthContext = {
  userId: string;
  email: string;
  name: string;
};

function getTokenFromRequest(request: NextRequest): string | null {
  const authorizationHeader = request.headers.get("authorization");

  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.slice(7).trim();
  }

  const tokenFromCookie = request.cookies.get("auth_token")?.value;
  return tokenFromCookie ?? null;
}

export async function requireAuth(request: NextRequest): Promise<
  | {
      ok: true;
      auth: AuthContext;
    }
  | {
      ok: false;
      response: NextResponse;
    }
> {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const payload = await verifyAuthToken(token);

    return {
      ok: true,
      auth: {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
      },
    };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }
}
