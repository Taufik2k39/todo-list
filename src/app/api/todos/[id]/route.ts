import { NextRequest } from "next/server";

import { deleteTodoController, editTodoController, showTodoController } from "@/controllers/todo-controller";

type ParamsContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: ParamsContext) {
  const { id } = await context.params;
  return showTodoController(request, id);
}

export async function PATCH(request: NextRequest, context: ParamsContext) {
  const { id } = await context.params;
  return editTodoController(request, id);
}

export async function DELETE(request: NextRequest, context: ParamsContext) {
  const { id } = await context.params;
  return deleteTodoController(request, id);
}
