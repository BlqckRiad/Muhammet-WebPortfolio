"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import DOMPurify from 'dompurify'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"

// Yardımcı fonksiyon: Basit markdown/işaretleme parser
function parseDescriptionToHtml(text: string) {
  if (!text) return ''
  let html = text
    // Kalın: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Paragraf başı: satır başı 4 boşluk veya \n    
    .replace(/(^|\n)\s{4,}/g, '<p style="text-indent:2em; margin:0;">')
    // Satır boşluğu: çift yeni satır
    .replace(/\n\n/g, '<br/><br/>')
    // Tek satır: <br>
    .replace(/\n/g, '<br/>')
  // Paragraf başı açıldıysa kapat
  html = html.replace(/<p style="text-indent:2em; margin:0;">(.*?)(<br\/>|$)/g, '<p style="text-indent:2em; margin:0;">$1</p>$2')
  return html
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogPost() {
      const supabase = createClient()
      const { data } = await supabase
        .from('muhammetblogs')
        .select('*')
        .eq('slug', params.slug)
        .single()
      
      setPost(data)
      setLoading(false)
    }

    fetchBlogPost()
  }, [params.slug])

  if (loading) {
    return (
      <div className="container py-12 md:py-24 lg:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Blog Yazılarına Dön
              </Link>
            </Button>
          </div>
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-bold">Yükleniyor...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container py-12 md:py-24 lg:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
          <h1 className="text-3xl font-bold">Yazı bulunamadı</h1>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Blog Yazılarına Dön
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[980px] flex-col gap-8">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Blog Yazılarına Dön
          </Link>
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{post.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(post.created_at).toLocaleDateString('tr-TR')} • {post.read_time}
            </span>
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {post.mini_description}
          </p>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Zengin metin desteği: işaretlemeleri HTML'e çevir ve güvenli şekilde göster */}
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parseDescriptionToHtml(post.description)) }} />
        </div>
      </div>
    </div>
  )
}
