"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditProfile() {
	const router = useRouter()
	const params = useParams<{ id: string }>()
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLoadingProfile, setIsLoadingProfile] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState("")
	const [successMessage, setSuccessMessage] = useState("")

	useEffect(() => {
		const loadProfile = async () => {
			setIsLoadingProfile(true)
			setErrorMessage("")

			try {
				const response = await fetch("/api/auth/profile", {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				})

				const result = await response.json()

				if (!response.ok) {
					setErrorMessage(result?.message ?? "Gagal memuat profil")
					if (response.status === 401) {
						router.push("/auth/login")
					}
					return
				}

				setName(result.data.name ?? "")
				setEmail(result.data.email ?? "")
			} catch {
				setErrorMessage("Terjadi kesalahan jaringan")
			} finally {
				setIsLoadingProfile(false)
			}
		}

		void loadProfile()
	}, [router])

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)
		setErrorMessage("")
		setSuccessMessage("")

		const payload: { name?: string; email?: string; password?: string } = {}
		if (name.trim()) {
			payload.name = name
		}
		if (email.trim()) {
			payload.email = email
		}
		if (password.trim()) {
			payload.password = password
		}

		try {
			const response = await fetch("/api/auth/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})

			const result = await response.json()

			if (!response.ok) {
				setErrorMessage(result?.message ?? "Gagal memperbarui profil")
				return
			}

			setSuccessMessage("Profil berhasil diperbarui")
			setPassword("")
			router.push(`/auth/${params.id}`)
			router.refresh()
		} catch {
			setErrorMessage("Terjadi kesalahan jaringan")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<section className="flex min-h-screen items-center justify-center p-3">
			<Card className="mx-auto w-full max-w-5xl border-2 border-black shadow-none dark:border-white dark:bg-black">
				<CardHeader>
					<CardTitle className="text-2xl">Edit Profile</CardTitle>
					<CardDescription>Perbarui informasi pribadi akun kamu.</CardDescription>
					{errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
					{successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}
				</CardHeader>

				<CardContent>
					{isLoadingProfile ? <p className="text-sm text-muted-foreground">Memuat data profil...</p> : null}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="edit-name">Nama Lengkap</Label>
							<Input
								id="edit-name"
								value={name}
								onChange={e => setName(e.target.value)}
								placeholder="Masukkan nama lengkap"
								disabled={isLoadingProfile || isSubmitting}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-email">Email</Label>
							<Input
								id="edit-email"
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder="nama@email.com"
								disabled={isLoadingProfile || isSubmitting}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-password">Password Baru (opsional)</Label>
							<Input
								id="edit-password"
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder="Minimal 6 karakter"
								disabled={isLoadingProfile || isSubmitting}
							/>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<Button type="button" variant="outline" className="w-full" asChild>
								<Link href={`/auth/${params.id}`}>
								Batal
								</Link>
							</Button>
							<Button type="submit" className="w-full" disabled={isLoadingProfile || isSubmitting}>
								{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
							</Button>
						</div>
					</form>
				</CardContent>

				<CardFooter className="text-sm text-muted-foreground">
					Pastikan data sudah benar sebelum disimpan.
				</CardFooter>
			</Card>
		</section>
	)
}
