import { NextRequest } from "next/server";

import { createTodoController, indexTodoController } from "@/controllers/todo-controller";

export async function GET(request: NextRequest) {
  return indexTodoController(request);
}

export async function POST(request: NextRequest) {
  return createTodoController(request);
}
