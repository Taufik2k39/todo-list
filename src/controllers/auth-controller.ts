import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { signAuthToken } from "@/lib/jwt";
import { findUserByEmail, findUserById, createUser, updateUser } from "@/models/user-model";
import { requireAuth } from "@/middleware/auth-middleware";

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(6).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function registerController(request: NextRequest) {
  try {
    const parsedBody = registerSchema.parse(await request.json());
    const email = normalizeEmail(parsedBody.email);

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsedBody.password, 10);
    const user = await createUser({
      name: parsedBody.name,
      email,
      passwordHash,
    });

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: "Register successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      },
      { status: 201 },
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten(),
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function loginController(request: NextRequest) {
  try {
    const parsedBody = loginSchema.parse(await request.json());
    const email = normalizeEmail(parsedBody.email);

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const passwordMatched = await bcrypt.compare(parsedBody.password, user.passwordHash);
    if (!passwordMatched) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten(),
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function userProfileController(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const user = await findUserById(authResult.auth.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function editProfileController(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const parsedBody = updateProfileSchema.parse(await request.json());
    const dataToUpdate: { name?: string; email?: string; passwordHash?: string } = {};

    if (parsedBody.name) {
      dataToUpdate.name = parsedBody.name;
    }

    if (parsedBody.email) {
      const nextEmail = normalizeEmail(parsedBody.email);
      const existingUser = await findUserByEmail(nextEmail);

      if (existingUser && existingUser.id !== authResult.auth.userId) {
        return NextResponse.json({ message: "Email already registered" }, { status: 409 });
      }

      dataToUpdate.email = nextEmail;
    }

    if (parsedBody.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(parsedBody.password, 10);
    }

    const user = await updateUser(authResult.auth.userId, dataToUpdate);

    return NextResponse.json({
      message: "Profile updated",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.flatten(),
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
