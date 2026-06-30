import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/middleware/auth-middleware";
import {
  createTodo,
  deleteTodoByIdAndUser,
  findTodoByIdAndUser,
  listTodosByUser,
  updateTodoByIdAndUser,
} from "@/models/todo-model";

const createTodoSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  completed: z.boolean().optional(),
});

const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().nullable().optional(),
    completed: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export async function indexTodoController(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const todos = await listTodosByUser(authResult.auth.userId);

    return NextResponse.json({ data: todos });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function createTodoController(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const parsedBody = createTodoSchema.parse(await request.json());

    const todo = await createTodo({
      title: parsedBody.title,
      description: parsedBody.description,
      completed: parsedBody.completed,
      userId: authResult.auth.userId,
    });

    return NextResponse.json(
      {
        message: "Todo created",
        data: todo,
      },
      { status: 201 },
    );
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

export async function showTodoController(request: NextRequest, id: string) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const todo = await findTodoByIdAndUser(id, authResult.auth.userId);
    if (!todo) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ data: todo });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function editTodoController(request: NextRequest, id: string) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const parsedBody = updateTodoSchema.parse(await request.json());

    const result = await updateTodoByIdAndUser(id, authResult.auth.userId, parsedBody);
    if (result.count === 0) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    const todo = await findTodoByIdAndUser(id, authResult.auth.userId);
    return NextResponse.json({
      message: "Todo updated",
      data: todo,
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

export async function deleteTodoController(request: NextRequest, id: string) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const result = await deleteTodoByIdAndUser(id, authResult.auth.userId);
    if (result.count === 0) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Todo deleted" });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
