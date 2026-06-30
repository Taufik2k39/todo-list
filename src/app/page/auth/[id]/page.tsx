import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { verifyAuthToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import DeleteAccountButton from "@/components/DeleteAccountButton";

type UserProfilePageProps = {
	params: Promise<{ id: string }>;
};

function formatMonthYear(date: Date): string {
	return new Intl.DateTimeFormat("id-ID", {
		month: "long",
		year: "numeric",
	}).format(date);
}

export default async function UserProfile({ params }: UserProfilePageProps) {
	const { id } = await params;
	const cookieStore = await cookies();
	const token = cookieStore.get("auth_token")?.value;

	if (!token) {
		redirect("/auth/login");
	}

	let authUserId = "";

	try {
		const payload = await verifyAuthToken(token);
		authUserId = payload.sub;
	} catch {
		redirect("/auth/login");
	}

	if (id !== authUserId) {
		notFound();
	}

	const [user, totalTasks, doneTasks] = await Promise.all([
		prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
			},
		}),
		prisma.todo.count({ where: { userId: id } }),
		prisma.todo.count({ where: { userId: id, completed: true } }),
	]);

	if (!user) {
		notFound();
	}

	const joinedAt = formatMonthYear(user.createdAt);

	return (
    <div className="flex min-h-screen items-center justify-center">
      <section className="mx-auto w-full max-w-5xl space-y-2">
        <Card className="border-2 border-black shadow-none dark:border-white dark:bg-black">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Member
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">
              Profil pengguna terhubung dengan data akun dari database.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border border-border shadow-none dark:border-white dark:bg-black">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Task</p>
                  <p className="text-2xl font-semibold">{totalTasks}</p>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-none dark:border-white dark:bg-black">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Task Selesai</p>
                  <p className="text-2xl font-semibold">{doneTasks}</p>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-none dark:border-white dark:bg-black">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Bergabung</p>
                  <p className="text-2xl font-semibold">{joinedAt}</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" asChild>
                <Link href={`/auth/${user.id}/edit`}>Edit Profile</Link>
              </Button>
              <DeleteAccountButton userId={user.id} />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
