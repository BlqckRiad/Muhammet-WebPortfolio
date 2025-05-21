import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Tip tanımlamaları
export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  summary: string
  category: string
  read_time: string
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  title: string
  description: string
  image_url: string
  tags: string[]
  link: string
  created_at: string
  updated_at: string
}

// Blog yazılarını getir
export async function getBlogPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Blog yazıları getirilirken hata oluştu:', error)
    return []
  }

  return data as BlogPost[]
}

// Projeleri getir
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Projeler getirilirken hata oluştu:', error)
    return []
  }

  return data as Project[]
}

// Blog yazısı detayını getir
export async function getBlogPost(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Blog yazısı getirilirken hata oluştu:', error)
    return null
  }

  return data as BlogPost
}

// İletişim formu mesajını kaydet
export async function saveContactMessage(name: string, email: string, message: string) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([
      {
        name,
        email,
        message,
      },
    ])
    .select()

  if (error) {
    console.error('Mesaj kaydedilirken hata oluştu:', error)
    throw error
  }

  return data
} 