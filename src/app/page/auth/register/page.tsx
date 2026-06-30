"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function Register() {
	const router = useRouter()
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
 	const [isLoading, setIsLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (password !== confirmPassword) {
			setErrorMessage("Konfirmasi password tidak sama")
			return
		}

		setIsLoading(true)
		setErrorMessage("")

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					email,
					password,
				}),
			})

			const result = await response.json()

			if (!response.ok) {
				setErrorMessage(result?.message ?? "Register gagal")
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
		<section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg items-center justify-center">
			<Card className="w-full border-2 border-black shadow-none dark:border-white dark:bg-black">
				<CardHeader>
					<CardTitle className="text-2xl">Register</CardTitle>
					<CardDescription>Buat akun baru untuk mulai mengelola to-do.</CardDescription>
					{errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nama Lengkap</Label>
							<Input
								id="name"
								type="text"
								placeholder="Masukkan nama"
								value={name}
								onChange={e => setName(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="register-email">Email</Label>
							<Input
								id="register-email"
								type="email"
								placeholder="nama@email.com"
								value={email}
								onChange={e => setEmail(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="register-password">Password</Label>
							<Input
								id="register-password"
								type="password"
								placeholder="Minimal 8 karakter"
								value={password}
								onChange={e => setPassword(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirm-password">Konfirmasi Password</Label>
							<Input
								id="confirm-password"
								type="password"
								placeholder="Ulangi password"
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								disabled={isLoading}
								required
							/>
						</div>

						<div className="flex items-center gap-2">
							<Checkbox id="terms" required disabled={isLoading} />
							<Label htmlFor="terms" className="text-sm font-normal leading-snug">
								Saya setuju dengan syarat dan ketentuan yang berlaku.
							</Label>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Memproses..." : "Daftar"}
						</Button>
					</form>
				</CardContent>

				<CardFooter className="justify-center text-sm text-muted-foreground">
					Sudah punya akun? <Link href="/auth/login" className="ml-1 underline">Login</Link>.
				</CardFooter>
			</Card>
		</section>
	)
}
