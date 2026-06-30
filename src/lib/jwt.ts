import { SignJWT, jwtVerify } from "jose";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
};

const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("Missing AUTH_SECRET in environment variables.");
}

const secret = new TextEncoder().encode(AUTH_SECRET);

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secret);

  if (!payload.sub || !payload.email || !payload.name) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: payload.sub,
    email: String(payload.email),
    name: String(payload.name),
  };
}
