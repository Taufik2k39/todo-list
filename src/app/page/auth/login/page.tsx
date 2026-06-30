"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Login() {
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
 	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsLoading(true)
		setErrorMessage("")

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					password,
				}),
			})

			const result = await response.json()

			if (!response.ok) {
				setErrorMessage(result?.message ?? "Login gagal")
				return
			}

			const userId = result?.data?.user?.id
			if (!userId) {
				setErrorMessage("Data user tidak valid")
				return
			}

			router.push(`/auth/${userId}`)
			router.refresh()
		} catch {
			setErrorMessage("Terjadi kesalahan jaringan")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md items-center justify-center">
			<Card className="w-full border-2 border-black shadow-none dark:border-white dark:bg-black">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>Masuk untuk melanjutkan ke dashboard tugas kamu.</CardDescription>
					{errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="nama@email.com"
								value={email}
								onChange={e => setEmail(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Minimal 8 karakter"
								value={password}
								onChange={e => setPassword(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Memproses..." : "Masuk"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="justify-center text-sm text-muted-foreground">
					Belum punya akun? <Link href="/auth/register" className="ml-1 underline">Daftar sekarang</Link>.
				</CardFooter>
			</Card>
		</section>
	)
}
