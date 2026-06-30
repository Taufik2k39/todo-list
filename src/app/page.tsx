"use client"
import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

type Todo = {
  id: string
  title: string
  completed: boolean
}

export default function TodoList() {
  return (
    <Suspense fallback={<section className="h-full w-full p-4 md:p-8">Memuat...</section>}>
      <TodoListContent />
    </Suspense>
  )
}

function TodoListContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isCreateFocusHighlight, setIsCreateFocusHighlight] = useState(false)

  const loadTodos = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/todos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.status === 401) {
        router.push("/auth/login")
        return
      }

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result?.message ?? "Gagal memuat todo")
        return
      }

      setTodos(result?.data ?? [])
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    void loadTodos()
  }, [loadTodos])

  useEffect(() => {
    if (searchParams.get("create") !== "1") {
      return
    }

    setIsCreateFocusHighlight(true)

    const timerId = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    const clearHighlightTimerId = window.setTimeout(() => {
      setIsCreateFocusHighlight(false)
    }, 1400)

    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.delete("create")
    const nextUrl = nextSearchParams.toString() ? `${pathname}?${nextSearchParams.toString()}` : pathname
    router.replace(nextUrl, { scroll: false })

    return () => {
      window.clearTimeout(timerId)
      window.clearTimeout(clearHighlightTimerId)
    }
  }, [pathname, router, searchParams])

  const addTodo = async () => {
    if (!newTodo.trim()) return

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result?.message ?? "Gagal menambah todo")
        return
      }

      setTodos((prevTodos) => [result.data, ...prevTodos])
      setNewTodo("")
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTodo = async (todo: Todo) => {
    setErrorMessage("")

    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result?.message ?? "Gagal memperbarui todo")
        return
      }

      setTodos((prevTodos) =>
        prevTodos.map((item) => (item.id === todo.id ? result.data : item)),
      )
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan")
    }
  }

  const deleteTodo = async (id: string) => {
    setErrorMessage("")

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result?.message ?? "Gagal menghapus todo")
        return
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id))
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan")
    }
  }

  return (
    <section className="h-full w-full overflow-hidden p-4 md:p-8">
      <div className="flex h-[calc(100%-4.5rem)] items-start justify-center overflow-hidden">
        <Card className="w-full max-w-5xl">
          <CardHeader>
            <CardTitle>Todo List</CardTitle>
            {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={newTodo}
                onChange={e => setNewTodo(e.target.value)}
                placeholder="Tambah tugas baru..."
                disabled={isSubmitting}
                className={isCreateFocusHighlight ? "border-lime-500 ring-2 ring-lime-500" : undefined}
              />
              <Button onClick={addTodo} disabled={isSubmitting || !newTodo.trim()}>
                {isSubmitting ? "Menyimpan..." : "Tambah"}
              </Button>
            </div>
            <Separator />
            <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Memuat data todo...</p>
              ) : todos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada tugas</p>
              ) : (
                todos.map(todo => (
                  <div key={todo.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => void toggleTodo(todo)}
                    />
                    <Label
                      className={`text-base md:text-lg font-medium ${
                        todo.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {todo.title}
                    </Label>
                    <Button
                      asChild
                      variant="secondary"
                    >
                      <Link href={`/page/todo/${todo.id}`}>Detail</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="ml-auto md:ml-0"
                      onClick={() => void deleteTodo(todo.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
