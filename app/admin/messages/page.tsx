"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface Message {
  id: string
  name: string
  email: string
  message: string
  is_processed: boolean
  created_at: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [filter, setFilter] = useState<"all" | "processed" | "unprocessed">("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('muhammetcontact').select('*').order('created_at', { ascending: false })
    if (filter === "processed") query = query.eq('is_processed', true)
    if (filter === "unprocessed") query = query.eq('is_processed', false)
    const { data, error } = await query
    if (error) {
      toast.error('Mesajlar yüklenemedi')
      setLoading(false)
      return
    }
    setMessages(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line
  }, [filter])

  const handleToggleProcessed = async (id: string, current: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetcontact')
      .update({ is_processed: !current })
      .eq('id', id)
    if (error) {
      toast.error('Durum güncellenemedi')
      return
    }
    toast.success('Durum güncellendi')
    fetchMessages()
  }

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Mesajlar</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>Tümü</Button>
          <Button variant={filter === "unprocessed" ? "default" : "outline"} onClick={() => setFilter("unprocessed")}>İlgilenilmedi</Button>
          <Button variant={filter === "processed" ? "default" : "outline"} onClick={() => setFilter("processed")}>İlgilenildi</Button>
        </div>
      </div>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : filteredMessages.length === 0 ? (
        <div>Hiç mesaj yok.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMessages.map(msg => (
            <Card key={msg.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{msg.name}</span>
                  <Badge variant={msg.is_processed ? "success" : "destructive"}>
                    {msg.is_processed ? "İlgilenildi" : "İlgilenilmedi"}
                  </Badge>
                </CardTitle>
                <div className="text-xs text-muted-foreground">{msg.email}</div>
                <div className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString('tr-TR')}</div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 whitespace-pre-line">{msg.message}</p>
                <Button
                  variant={msg.is_processed ? "outline" : "default"}
                  onClick={() => handleToggleProcessed(msg.id, msg.is_processed)}
                >
                  {msg.is_processed ? "İlgilenilmedi olarak işaretle" : "İlgilenildi olarak işaretle"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 