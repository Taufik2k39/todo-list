import { prisma } from "@/lib/prisma";

export type CreateTodoInput = {
  title: string;
  description?: string;
  completed?: boolean;
  userId: string;
};

export type UpdateTodoInput = {
  title?: string;
  description?: string | null;
  completed?: boolean;
};

export async function listTodosByUser(userId: string) {
  return prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTodo(data: CreateTodoInput) {
  return prisma.todo.create({ data });
}

export async function findTodoByIdAndUser(id: string, userId: string) {
  return prisma.todo.findFirst({
    where: { id, userId },
  });
}

export async function updateTodoByIdAndUser(id: string, userId: string, data: UpdateTodoInput) {
  return prisma.todo.updateMany({
    where: { id, userId },
    data,
  });
}

export async function deleteTodoByIdAndUser(id: string, userId: string) {
  return prisma.todo.deleteMany({
    where: { id, userId },
  });
}
