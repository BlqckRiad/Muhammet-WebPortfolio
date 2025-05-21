"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır"),
})

type FormData = z.infer<typeof formSchema>

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = form.getValues()
    const validationResult = formSchema.safeParse(formData)

    if (!validationResult.success) {
      const errors = validationResult.error.errors
      errors.forEach((error) => {
        alert(error.message)
      })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('muhammetcontact')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message,
            is_processed: false
          }
        ])

      if (error) throw error

      alert("Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağım.")
      form.reset()
    } catch (error) {
      alert("Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            İsim
          </label>
          <Input
            id="name"
            placeholder="Adınız"
            {...form.register("name")}
            disabled={isLoading}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            E-posta
          </label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            {...form.register("email")}
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Mesaj
          </label>
          <Textarea
            id="message"
            placeholder="Mesajınızı buraya yazın..."
            className="min-h-[120px]"
            {...form.register("message")}
            disabled={isLoading}
          />
          {form.formState.errors.message && (
            <p className="text-sm text-red-500">{form.formState.errors.message.message}</p>
          )}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  )
}
