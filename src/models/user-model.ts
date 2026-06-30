import { prisma } from "@/lib/prisma";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  passwordHash?: string;
};

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id },
    data,
  });
}
