"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

type TodoDetail = {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

export default function EditTodoPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const todoId = params?.id ?? ""

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [completed, setCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNotFound, setIsNotFound] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

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

        if (!isMounted) return

        if (response.status === 404) {
          setIsNotFound(true)
          return
        }

        if (!response.ok) {
          setErrorMessage(result?.message ?? "Gagal memuat data todo")
          return
        }

        const todo = result?.data as TodoDetail

        setTitle(todo.title)
        setDescription(todo.description ?? "")
        setCompleted(Boolean(todo.completed))
      } catch {
        if (!isMounted) return
        setErrorMessage("Terjadi kesalahan jaringan")
      } finally {
        if (!isMounted) return
        setIsLoading(false)
      }
    }

    void loadTodo()

    return () => {
      isMounted = false
    }
  }, [router, todoId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!title.trim()) {
      setErrorMessage("Judul tidak boleh kosong")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          completed,
        }),
      })

      if (response.status === 401) {
        router.push("/auth/login")
        return
      }

      const result = await response.json()

      if (response.status === 404) {
        setIsNotFound(true)
        return
      }

      if (!response.ok) {
        setErrorMessage(result?.message ?? "Gagal memperbarui todo")
        return
      }

      router.push(`/page/todo/${todoId}`)
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="h-full w-full overflow-hidden p-4 md:p-8">
      <div className="flex h-[calc(100%-4.5rem)] items-start justify-center overflow-hidden">
        <Card className="w-full max-w-5xl">
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle>Edit Todo</CardTitle>
            <Button asChild variant="outline">
              <Link href={`/page/todo/${todoId}`}>Kembali</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? <p className="text-sm text-muted-foreground">Memuat...</p> : null}
            {isNotFound ? <p className="text-sm text-muted-foreground">Todo tidak ditemukan.</p> : null}
            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

            {!isLoading && !isNotFound ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="title">Judul</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="completed"
                    checked={completed}
                    onCheckedChange={(value) => setCompleted(Boolean(value))}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="completed">Selesai</Label>
                </div>

                <Separator />

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Button asChild variant="secondary" disabled={isSubmitting}>
                    <Link href={`/page/todo/${todoId}`}>Batal</Link>
                  </Button>
                </div>
              </form>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
