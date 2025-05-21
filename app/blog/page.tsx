"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogPosts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('muhammetblogs')
        .select('*')
        .order('created_at', { ascending: false })
      
      setBlogPosts(data || [])
      setLoading(false)
    }

    fetchBlogPosts()
  }, [])

  if (loading) {
    return (
      <div className="container py-12 md:py-24 lg:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
          <div className="flex w-full items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
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

  return (
    <div className="container py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
        <div className="flex w-full items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>

        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Blog Yazıları
          </h1>
          <p className="text-lg text-muted-foreground">
            Web geliştirme, programlama ve teknoloji hakkında yazılar
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post: any) => (
            <Card key={post.id} className="group flex flex-col">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="space-y-1">
                  <Badge variant="secondary">{post.category}</Badge>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                    <span>•</span>
                    <span>{post.read_time}</span>
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-3 text-muted-foreground">{post.mini_description}</p>
              </CardContent>
              <CardFooter className="mt-auto border-t pt-4">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href={`/blog/${post.slug}`}>
                    Devamını Oku <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
