"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type TodoDetail = {
	id: string
	title: string
	description: string | null
	completed: boolean
	createdAt: string
	updatedAt: string
}

export default function TodoDetailPage() {
	const router = useRouter()
	const params = useParams<{ id: string }>()
	const [todo, setTodo] = useState<TodoDetail | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [errorMessage, setErrorMessage] = useState("")
	const [isNotFound, setIsNotFound] = useState(false)

	const todoId = params?.id ?? ""

	useEffect(() => {
		if (!todoId) {
			setIsLoading(false)
			setIsNotFound(true)
			return
		}

		let isMounted = true

		const loadTodo = async () => {
			setIsLoading(true)
			setErrorMessage("")
			setIsNotFound(false)

			try {
				const response = await fetch(`/api/todos/${todoId}`, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				})

				if (response.status === 401) {
					router.push("/auth/login")
					return
				}

				const result = await response.json()

				if (!isMounted) {
					return
				}

				if (response.status === 404) {
					setTodo(null)
					setIsNotFound(true)
					return
				}

				if (!response.ok) {
					setErrorMessage(result?.message ?? "Gagal memuat detail todo")
					return
				}

				setTodo(result?.data ?? null)
			} catch {
				if (isMounted) {
					setErrorMessage("Terjadi kesalahan jaringan")
				}
			} finally {
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}

		void loadTodo()

		return () => {
			isMounted = false
		}
	}, [router, todoId])

	const createdAtLabel = useMemo(() => {
		if (!todo?.createdAt) return "-"
		return new Date(todo.createdAt).toLocaleString("id-ID")
	}, [todo?.createdAt])

	const updatedAtLabel = useMemo(() => {
		if (!todo?.updatedAt) return "-"
		return new Date(todo.updatedAt).toLocaleString("id-ID")
	}, [todo?.updatedAt])

	return (
		<section className="h-full w-full overflow-hidden p-4 md:p-8">
			<div className="flex h-[calc(100%-4.5rem)] items-start justify-center overflow-hidden">
				<Card className="w-full max-w-5xl">
					<CardHeader className="flex flex-row items-start justify-between gap-3">
						<CardTitle>Detail Todo</CardTitle>
						<Button asChild variant="outline">
							<Link href="/">Kembali</Link>
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						{isLoading ? <p className="text-sm text-muted-foreground">Memuat detail todo...</p> : null}

						{!isLoading && errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

						{!isLoading && isNotFound ? (
							<p className="text-sm text-muted-foreground">Todo tidak ditemukan</p>
						) : null}

						{!isLoading && !errorMessage && !isNotFound && todo ? (
							<div className="space-y-4">
								<div className="flex items-center justify-between gap-3">
									<h2 className="text-xl font-semibold md:text-2xl">{todo.title}</h2>
									<Badge variant={todo.completed ? "default" : "secondary"}>
										{todo.completed ? "Selesai" : "Belum selesai"}
									</Badge>
								</div>

								<Separator />

								<div className="space-y-1">
									<p className="text-sm font-medium">Deskripsi</p>
									<p className="text-sm text-muted-foreground">
										{todo.description?.trim() ? todo.description : "Tidak ada deskripsi"}
									</p>
								</div>

								<Separator />

								<div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
									<div>
										<p className="font-medium">ID Todo</p>
										<p className="break-all text-muted-foreground">{todo.id}</p>
									</div>
									<div>
										<p className="font-medium">Status</p>
										<p className="text-muted-foreground">
											{todo.completed ? "Sudah diselesaikan" : "Masih dikerjakan"}
										</p>
									</div>
									<div>
										<p className="font-medium">Dibuat</p>
										<p className="text-muted-foreground">{createdAtLabel}</p>
									</div>
									<div>
										<p className="font-medium">Diperbarui</p>
										<p className="text-muted-foreground">{updatedAtLabel}</p>
									</div>
								</div>
							</div>
						) : null}

						{/*update button*/}
						{!isLoading && !errorMessage && !isNotFound && todo ? (
							<div className="pt-4">
								<Button asChild>
									<Link href={`/page/todo/${todo.id}/edit`}>Edit Todo</Link>
								</Button>
							</div>
						) : null}
					</CardContent>
				</Card>
			</div>
		</section>
	)
}
